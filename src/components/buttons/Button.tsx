import { $, component$, QRL, Slot } from '@qwik.dev/core';

type Props = {
	extraClass?: string;
	onClick$?: QRL<() => void>;
};

export const Button = component$<Props>(({ extraClass = '', onClick$ }) => {
	return (
		<button
			type="button"
			class={`flex items-center justify-around bg-gray-100 border rounded-md py-2 px-4 text-base font-medium text-black hover:bg-gray-300 focus:outline-none ${extraClass}`}
			onClick$={$(async () => {
				onClick$ && onClick$();
			})}
		>
			<Slot />
		</button>
	);
});
