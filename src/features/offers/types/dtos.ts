// Offers feature – request / response DTOs

export interface AcceptOfferRequest {
  offerId: string;
}

export interface SubmitOfferRequest {
  requestId: string;
  quoteEGP: number;
  estimatedDelivery?: string;
  description?: string;
  coverage?: "Insured" | "None";
}

export interface RejectOfferRequest {
  offerId: string;
  reason?: string;
}
