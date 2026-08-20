import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNegotiation, createOffer, respondToOffer, counterResponse } from './api';

export const useCreateNegotiationMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createNegotiation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['buyerNegotiations'] });
        },
    });
};

export const useCreateOfferMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['negotiation'] });
            queryClient.invalidateQueries({ queryKey: ['buyerNegotiations'] });
            queryClient.invalidateQueries({ queryKey: ['sellerNegotiations'] });
        },
    });
};

export const useRespondToOfferMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: respondToOffer,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['negotiation'] });
            queryClient.invalidateQueries({ queryKey: ['buyerNegotiations'] });
            queryClient.invalidateQueries({ queryKey: ['sellerNegotiations'] });
        },
    });
};

export const useCounterResponseMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: counterResponse,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['negotiation'] });
            queryClient.invalidateQueries({ queryKey: ['buyerNegotiations'] });
            queryClient.invalidateQueries({ queryKey: ['sellerNegotiations'] });
        },
    });
};

// Buyer responds to a seller's counter-offer (Accept / Reject)
export const useRespondToCounterOfferMutation = useCounterResponseMutation;
export const useSubmitCounterOfferMutation = useRespondToOfferMutation;

