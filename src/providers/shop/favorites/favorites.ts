import gql from 'graphql-tag';
import {
	CreateFavoriteMutation,
	DeleteFavoriteMutation,
	FavoriteQuery,
} from '~/generated/graphql-shop';
import { shopSdk } from '~/graphql-wrapper';

export const getFavoriteQuery = async (productId: string) => {
	return shopSdk.favorite({ id: productId }).then((res: FavoriteQuery) => res.favorite);
};

export const createFavoriteMutation = async (productId: string) => {
	return shopSdk
		.createFavorite({ id: productId })
		.then((res: CreateFavoriteMutation) => res.createFavorite);
};

export const deleteFavoriteMutation = async (id: string) => {
	return shopSdk.deleteFavorite({ id }).then((res: DeleteFavoriteMutation) => res.deleteFavorite);
};

gql`
	query favorite($id: ID!) {
		favorite(productId: $id) {
			id
			product {
				id
				name
				description
				collections {
					id
					slug
					name
					breadcrumbs {
						id
						name
						slug
					}
				}
				facetValues {
					facet {
						id
						code
						name
					}
					id
					code
					name
				}
				featuredAsset {
					id
					preview
				}
				assets {
					id
					preview
				}
				variants {
					id
					name
					priceWithTax
					currencyCode
					sku
					stockLevel
					featuredAsset {
						id
						preview
					}
				}
			}
		}
	}
`;

gql`
	mutation createFavorite($id: ID!) {
		createFavorite(input: { productId: $id }) {
			id
		}
	}
`;

gql`
	mutation deleteFavorite($id: ID!) {
		deleteFavorite(id: $id) {
			__typename
			message
			result
		}
	}
`;
