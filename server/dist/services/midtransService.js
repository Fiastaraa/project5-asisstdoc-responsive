import "dotenv/config";
import crypto from "crypto";
export class MidtransService {
    get serverKey() {
        return process.env.MIDTRANS_SERVER_KEY || "";
    }
    get clientKey() {
        return process.env.MIDTRANS_CLIENT_KEY || "";
    }
    get isProduction() {
        return process.env.MIDTRANS_IS_PRODUCTION === "true";
    }
    get isConfigured() {
        const s = this.serverKey.trim();
        const c = this.clientKey.trim();
        return (Boolean(s) &&
            !s.includes("YOUR_SERVER_KEY_HERE") &&
            Boolean(c) &&
            !c.includes("YOUR_CLIENT_KEY_HERE"));
    }
    getAuthHeader() {
        return `Basic ${Buffer.from(`${this.serverKey}:`).toString("base64")}`;
    }
    getSnapBaseUrl() {
        return this.isProduction
            ? "https://app.midtrans.com/snap/v1/transactions"
            : "https://app.sandbox.midtrans.com/snap/v1/transactions";
    }
    getCoreBaseUrl() {
        return this.isProduction
            ? "https://api.midtrans.com/v2"
            : "https://api.sandbox.midtrans.com/v2";
    }
    getSnapScriptUrl() {
        return this.isProduction
            ? "https://app.midtrans.com/snap/snap.js"
            : "https://app.sandbox.midtrans.com/snap/snap.js";
    }
    getConfig() {
        return {
            clientKey: this.clientKey,
            isProduction: this.isProduction,
            snapScriptUrl: this.getSnapScriptUrl(),
            isConfigured: this.isConfigured,
        };
    }
    /**
     * Create Snap payment token and redirect URL
     */
    async createSnapTransaction(payload) {
        // If real keys are not yet configured in .env, provide simulated sandbox token
        if (!this.isConfigured) {
            const orderId = payload.transaction_details.order_id;
            return {
                token: `mock-snap-${orderId}`,
                redirect_url: `https://app.sandbox.midtrans.com/snap/v2/vtweb/simulated-${orderId}`,
            };
        }
        const response = await fetch(this.getSnapBaseUrl(), {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: this.getAuthHeader(),
            },
            body: JSON.stringify(payload),
        });
        const data = (await response.json());
        if (!response.ok) {
            const errorMsg = (data?.error_messages && data.error_messages.join(", ")) ||
                data?.message ||
                "Failed to create Midtrans Snap transaction";
            throw new Error(errorMsg);
        }
        return {
            token: data.token,
            redirect_url: data.redirect_url,
        };
    }
    /**
     * Check transaction status directly via Midtrans Core API
     */
    async checkTransactionStatus(orderId) {
        if (!this.serverKey) {
            throw new Error("MIDTRANS_SERVER_KEY is not configured in .env");
        }
        const response = await fetch(`${this.getCoreBaseUrl()}/${orderId}/status`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                Authorization: this.getAuthHeader(),
            },
        });
        const data = (await response.json());
        if (!response.ok) {
            throw new Error(data?.status_message || "Failed to fetch Midtrans transaction status");
        }
        return data;
    }
    /**
     * Verify signature_key sent in webhook notification using SHA-512
     * Formula: SHA512(order_id + status_code + gross_amount + ServerKey)
     */
    verifySignature(orderId, statusCode, grossAmount, signatureKey) {
        if (!this.serverKey || !signatureKey) {
            return false;
        }
        const payload = `${orderId}${statusCode}${grossAmount}${this.serverKey}`;
        const hash = crypto.createHash("sha512").update(payload).digest("hex");
        return hash === signatureKey;
    }
    /**
     * Map Midtrans payment_type to Prisma PaymentMethod enum (CASH, TRANSFER, E_WALLET)
     */
    mapPaymentMethod(paymentType = "") {
        const pt = paymentType.toLowerCase();
        if (pt.includes("qris") ||
            pt.includes("gopay") ||
            pt.includes("shopeepay") ||
            pt.includes("ovo") ||
            pt.includes("dana") ||
            pt.includes("wallet")) {
            return "E_WALLET";
        }
        if (pt.includes("bank_transfer") ||
            pt.includes("echannel") ||
            pt.includes("va") ||
            pt.includes("cstore") ||
            pt.includes("credit_card") ||
            pt.includes("bca") ||
            pt.includes("bni") ||
            pt.includes("bri") ||
            pt.includes("mandiri") ||
            pt.includes("permata")) {
            return "TRANSFER";
        }
        return "TRANSFER";
    }
}
export const midtransService = new MidtransService();
