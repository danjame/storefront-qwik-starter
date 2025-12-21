import { component$ } from '@qwik.dev/core';
import { _ } from 'compiled-i18n';
import { Review } from '~/types';
import StarIcon from '../icons/StarIcon';

interface ReviewsProps {
	reviews: Review[];
}

export default component$<ReviewsProps>(({ reviews }) => {
	return (
		<div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-6xl lg:px-8">
			<h2 class="text-lg font-medium text-gray-900">{_`Recent reviews`}</h2>
			<div class="mt-6 pb-10 border-t border-gray-200 divide-y divide-gray-200 space-y-10">
				{reviews.map((review) => (
					<div key={review.id} class="pt-10 lg:grid lg:grid-cols-12 lg:gap-x-8">
						<div class="lg:col-start-5 lg:col-span-8 xl:col-start-4 xl:col-span-9 xl:grid xl:grid-cols-3 xl:gap-x-8 xl:items-start">
							<div class="flex items-center xl:col-span-1">
								<div class="flex items-center">
									{[0, 1, 2, 3, 4].map((rating) => (
										<div key={rating}>
											<StarIcon rating={rating} review={review} />
										</div>
									))}
								</div>
								<p class="ml-3 text-sm text-gray-700">
									{review.rating}
									<span class="sr-only"> out of 5 stars</span>
								</p>
							</div>

							<div class="mt-4 lg:mt-6 xl:mt-0 xl:col-span-2">
								<div
									class="space-y-6 text-sm text-gray-500"
									dangerouslySetInnerHTML={review.comment}
								/>
							</div>
						</div>

						<div class="mt-6 flex items-center text-sm lg:mt-0 lg:col-start-1 lg:col-span-4 lg:row-start-1 lg:flex-col lg:items-start xl:col-span-3">
							<p class="font-medium text-gray-900">{review.author.firstName}</p>
							<time
								dateTime={review.createdAt}
								class="ml-4 border-l border-gray-200 pl-4 text-gray-500 lg:ml-0 lg:mt-2 lg:border-0 lg:pl-0"
							>
								{new Date(review.createdAt).toLocaleDateString()}
							</time>
						</div>
					</div>
				))}
			</div>
		</div>
	);
});
