import { connectDb } from "@/lib/db";
import { ApiError } from "@/lib/errors";
import { nanoid } from "nanoid";
import { Types } from "mongoose";
import { ProductModel, type Product } from "@/models/product";
import { ProductOrderModel } from "@/models/productOrder";
import { PaymentModel } from "@/models/payment";
import { getPaymentProvider } from "@/services/payments";
import { emailService } from "@/services/emailService";
import { settingsService } from "@/services/settingsService";

const kobo = (n: number) => `₦${(n / 100).toLocaleString("en-NG")}`;

export const productOrderService = {
  // Create a PENDING shop order. Prices always come from the DB, never the
  // client — same rule as ticket orders.
  async create(input: {
    items: { productId: string; quantity: number }[];
    customer: { name: string; email: string; phone?: string };
    deliveryNote?: string;
  }) {
    await connectDb();

    const ids = input.items.map((i) => new Types.ObjectId(i.productId));
    const products = await ProductModel.find({
      _id: { $in: ids },
      published: true,
    }).lean<Product[]>();
    if (products.length !== ids.length)
      throw new ApiError("NOT_FOUND", "One of those items isn't available anymore.", 400);

    let subtotal = 0;
    const orderItems = input.items.map((it) => {
      const p = products.find((x) => String(x._id) === it.productId)!;
      if (!p.inStock)
        throw new ApiError("VALIDATION_ERROR", `“${p.name}” is sold out.`, 400);
      const quantity = Math.max(1, Math.min(20, Math.floor(it.quantity)));
      subtotal += p.price * quantity;
      return {
        productId: p._id,
        name: p.name,
        unitPrice: p.price,
        quantity,
      };
    });

    const order = await ProductOrderModel.create({
      items: orderItems,
      customerName: input.customer.name,
      customerEmail: input.customer.email,
      customerPhone: input.customer.phone,
      deliveryNote: input.deliveryNote ?? "",
      status: "PENDING",
      subtotal,
      total: subtotal,
      currency: "NGN",
      paymentReference: `SHP-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`,
    });
    return order.toObject();
  },

  /**
   * Confirm a shop payment by Paystack reference — mirrors
   * paymentService.confirmPaystackPayment for event orders but fulfils a
   * product order instead (no tickets, just emails).
   */
  async confirmPayment(reference: string) {
    await connectDb();

    const existing = await PaymentModel.findOne({ providerReference: reference });
    if (existing?.status === "SUCCESS") {
      return { status: "PAID" as const, orderId: existing.orderId.toString() };
    }

    const verify = await getPaymentProvider().verify(reference);
    if (verify.status !== "success") {
      if (["failed", "abandoned", "reversed", "cancelled"].includes(verify.status)) {
        await ProductOrderModel.updateOne(
          { paymentReference: reference, status: { $in: ["PENDING", "PAYMENT_PROCESSING"] } },
          { $set: { status: "FAILED" } },
        );
      }
      return { status: "UNPAID" as const };
    }

    const order = await ProductOrderModel.findOne({ paymentReference: reference });
    if (!order) return { status: "ORDER_NOT_FOUND" as const };

    if (verify.amount !== order.total || verify.currency !== order.currency) {
      return { status: "AMOUNT_MISMATCH" as const };
    }

    await PaymentModel.findOneAndUpdate(
      { providerReference: reference },
      {
        orderId: order._id,
        provider: "PAYSTACK",
        providerReference: reference,
        amount: order.total,
        currency: order.currency,
        status: "SUCCESS",
        providerResponse: verify,
        paidAt: new Date(verify.paid_at ?? Date.now()),
      },
      { upsert: true, new: true },
    );

    if (order.status !== "PAID") {
      order.status = "PAID";
      await order.save();
      await this.sendConfirmationEmails(order.toObject()).catch(() => {});
    }

    return { status: "PAID" as const, orderId: order._id.toString() };
  },

  // Buyer receipt + a heads-up to the team inbox (if configured).
  async sendConfirmationEmails(order: {
    _id: unknown;
    items: { name: string; quantity: number; unitPrice: number }[];
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
    deliveryNote?: string;
    total: number;
    paymentReference: string;
  }) {
    const lines = order.items
      .map((i) => `${i.quantity} × ${i.name} — ${kobo(i.unitPrice * i.quantity)}`)
      .join("\n");

    await emailService.send({
      to: order.customerEmail,
      subject: `Your SerenArt order ${order.paymentReference}`,
      template: "shop-order-confirmation",
      text:
        `Hi ${order.customerName},\n\n` +
        `Thanks for your order — payment confirmed.\n\n` +
        `${lines}\n\nTotal: ${kobo(order.total)}\nReference: ${order.paymentReference}\n\n` +
        `We'll be in touch about delivery/collection. Any questions, just reply to this email.`,
      meta: { orderId: String(order._id), reference: order.paymentReference },
    });

    const notify = (await settingsService.getPublic().catch(() => null))?.enquiryNotifyEmails ?? [];
    if (notify.length) {
      await emailService.send({
        to: notify.join(","),
        subject: `New shop order — ${order.paymentReference}`,
        template: "shop-order-admin",
        text:
          `New paid shop order.\n\n${lines}\n\nTotal: ${kobo(order.total)}\n` +
          `Customer: ${order.customerName} <${order.customerEmail}>${order.customerPhone ? ` · ${order.customerPhone}` : ""}\n` +
          (order.deliveryNote ? `Delivery note: ${order.deliveryNote}\n` : "") +
          `Reference: ${order.paymentReference}`,
        meta: { orderId: String(order._id), reference: order.paymentReference },
      });
    }
  },
};
