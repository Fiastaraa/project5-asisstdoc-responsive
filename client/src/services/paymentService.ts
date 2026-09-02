import api from "./api";

export interface MidtransConfig {
  clientKey: string;
  isProduction: boolean;
  snapScriptUrl: string;
  isConfigured?: boolean;
}

export interface SnapResponse {
  token: string;
  redirectUrl: string;
  orderId: string;
  grossAmount: number;
  invoiceId: number;
}

export interface SnapCallbacks {
  onSuccess?: (result: any) => void;
  onPending?: (result: any) => void;
  onError?: (result: any) => void;
  onClose?: () => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, callbacks?: SnapCallbacks) => void;
      embed: (token: string, options: { embedId: string } & SnapCallbacks) => void;
    };
  }
}

export const paymentService = {
  /**
   * Get Midtrans public configuration (Client Key, Snap script URL, isConfigured)
   */
  getConfig: async (): Promise<MidtransConfig> => {
    const res = await api.get("/payments/config");
    return res.data?.data;
  },

  /**
   * Request a Midtrans Snap Token for an unpaid invoice
   */
  createSnapToken: async (invoiceId: number): Promise<SnapResponse> => {
    const res = await api.post("/payments/snap-token", { invoiceId });
    return res.data?.data;
  },

  /**
   * Check payment transaction status directly with Midtrans
   */
  checkStatus: async (orderId: string) => {
    const res = await api.get(`/payments/status/${orderId}`);
    return res.data?.data;
  },

  /**
   * Load Midtrans snap.js dynamically if not already loaded
   */
  loadSnapScript: async (): Promise<void> => {
    if (window.snap) return;

    const config = await paymentService.getConfig();
    return new Promise((resolve, reject) => {
      const scriptId = "midtrans-snap-script";
      if (document.getElementById(scriptId)) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.id = scriptId;
      script.src = config.snapScriptUrl;
      script.setAttribute("data-client-key", config.clientKey);
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load Midtrans Snap script"));
      document.body.appendChild(script);
    });
  },

  /**
   * Trigger Midtrans Snap popup directly (or simulated payment if in demo mode)
   */
  payWithSnap: async (invoiceId: number, callbacks?: SnapCallbacks) => {
    const config = await paymentService.getConfig();
    const isMock =
      !config.isConfigured ||
      !config.clientKey ||
      config.clientKey.includes("YOUR_CLIENT_KEY_HERE");

    const snapData = await paymentService.createSnapToken(invoiceId);

    if (isMock || snapData.token.startsWith("mock-snap-")) {
      // Simulate realistic network delay for demo/sandbox fallback
      await new Promise((resolve) => setTimeout(resolve, 800));
      await api.post("/payments/mock-settle", { invoiceId, method: "E_WALLET" });

      callbacks?.onSuccess?.({
        transaction_status: "settlement",
        payment_type: "qris",
        order_id: snapData.orderId,
        mock: true,
      });

      return snapData;
    }

    await paymentService.loadSnapScript();

    if (window.snap) {
      window.snap.pay(snapData.token, callbacks);
    } else {
      // Fallback to redirect URL if popup is blocked
      window.location.href = snapData.redirectUrl;
    }

    return snapData;
  },
};
