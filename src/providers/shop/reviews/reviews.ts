import gql from 'graphql-tag';
import {
	CreateReviewInput,
	CreateReviewMutation,
	ReviewQuery,
	ReviewsQuery,
} from '~/generated/graphql-shop';
import { shopSdk } from '~/graphql-wrapper';

export const getReviewQuery = async (orderId: string, productVariantId: string) => {
	return shopSdk.review({ orderId, productVariantId }).then((res: ReviewQuery) => res.review);
};

export const getReviewsQuery = async (productId: string) => {
	return shopSdk
		.reviews({
			productId,
			options: {
				sort: { createdAt: 'DESC' },
				filter: {
					approved: { eq: true },
				},
			},
		})
		.then((res: ReviewsQuery) => res.reviews);
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
	query reviews($productId: ID!, $options: ReviewListOptions) {
		reviews(productId: $productId, options: $options) {
			totalItems
			items {
				id
				rating
				comment
				approved
				author {
					title
					firstName
					lastName
				}
				createdAt
			}
		}
	}
`;

gql`
	mutation createReview($input: CreateReviewInput!) {
		createReview(input: $input) {
			id
			rating
			comment
			approved
		}
	}
`;
