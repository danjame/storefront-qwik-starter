import gql from 'graphql-tag';
import { CreateReviewInput, CreateReviewMutation, ReviewQuery } from '~/generated/graphql-shop';
import { shopSdk } from '~/graphql-wrapper';

export const getReviewQuery = async (orderId: string, productVariantId: string) => {
	return shopSdk.review({ orderId, productVariantId }).then((res: ReviewQuery) => res.review);
};

export const createReviewMutation = async (input: CreateReviewInput) => {
	return shopSdk.createReview({ input }).then((res: CreateReviewMutation) => res.createReview);
};

gql`
	query review($orderId: ID!, $productVariantId: ID!) {
		review(orderId: $orderId, productVariantId: $productVariantId) {
			id
			rating
		}
	}
`;

gql`
	mutation createReview($input: CreateReviewInput!) {
		createReview(input: $input) {
			__typename
			... on Review {
				id
				rating
				comment
				approved
			}
			... on ErrorResult {
				errorCode
				message
			}
		}
	}
`;
