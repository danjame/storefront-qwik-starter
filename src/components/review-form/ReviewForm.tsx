import { $, component$ } from '@qwik.dev/core';
import { _ } from 'compiled-i18n';
import StarRating from '../star-rating/StarRating';

type IProps = {
	form: {
		rating: number;
		comment: string;
	};
};

export default component$<IProps>(({ form }) => {
	const handleRate$ = $((value: number) => {
		form.rating = value;
	});
	return (
		<form class="w-full">
			<div class="mt-4">
				<label class="block text-sm font-medium text-gray-700">{_`Rating`}</label>
				<div class="mt-1">
					<StarRating value={form.rating} onRate$={handleRate$} />
				</div>
			</div>
			<div class="mt-4">
				<label class="block text-sm font-medium text-gray-700">{_`Comment`}</label>
				<div class="mt-1">
					<textarea
						rows={3}
						placeholder="Write your comment here..."
						value={form.comment}
						onInput$={(_, el) => {
							form.comment = el.value;
							el.style.height = 'auto';
							el.style.height = `${el.scrollHeight}px`;
						}}
						class="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
					/>
				</div>
			</div>
		</form>
	);
});
