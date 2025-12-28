import { $, component$, noSerialize, useContext, useStore, useVisibleTask$ } from '@qwik.dev/core';
import { useLocation } from '@qwik.dev/router';
import { Stripe, StripeElements, loadStripe } from '@stripe/stripe-js';
import { _ } from 'compiled-i18n';
import { APP_STATE } from '~/constants';
import { ENV_VARIABLES } from '~/env';
import { createStripePaymentIntentMutation } from '~/providers/shop/checkout/checkout';
import CreditCardIcon from '../icons/CreditCardIcon';
import XCircleIcon from '../icons/XCircleIcon';

let _stripe: Promise<Stripe | null>;
function getStripe(publishableKey: string) {
	if (!_stripe && publishableKey) {
		_stripe = loadStripe(publishableKey);
	}
	return _stripe;
}
const stripePromise = getStripe(ENV_VARIABLES.VITE_STRIPE_PUBLISHABLE_KEY);

export default component$(() => {
	const appState = useContext(APP_STATE);
	const baseUrl = useLocation().url.origin;
	const store = useStore({
		clientSecret: '',
		resolvedStripe: noSerialize({} as Stripe),
		stripeElements: noSerialize({} as StripeElements),
		error: '',
	});

	useVisibleTask$(async () => {
		store.clientSecret = await createStripePaymentIntentMutation();

		await stripePromise.then((stripe) => {
			store.resolvedStripe = noSerialize(stripe as Stripe);
			store.stripeElements = noSerialize(stripe?.elements({ clientSecret: store.clientSecret }));
			store.stripeElements?.create('payment').mount('#payment-form');
		});
	});

	return (
		<div class="flex flex-col items-center max-w-xs">
			<div id="payment-form" class="mb-8"></div>
			{store.error !== '' && (
				<div class="rounded-md bg-red-50 p-4 mb-8">
					<div class="flex">
						<div class="flex-shrink-0">
							<XCircleIcon />
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-red-800">{_`We ran into a problem with payment!`}</h3>
							<p class="text-sm text-red-700 mt-2">{store.error}</p>
						</div>
					</div>
				</div>
			)}

			<button
				class="flex px-6 bg-primary-600 hover:bg-primary-700 items-center justify-center space-x-2 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
				disabled={!_stripe}
				onClick$={$(async () => {
					const submitResult = await store.stripeElements?.submit();
					if (submitResult?.error) {
						store.error = submitResult.error.message as string;
						return;
					}

					const confirmResult = await store.resolvedStripe?.confirmPayment({
						elements: store.stripeElements,
						clientSecret: store.clientSecret,
						confirmParams: {
							return_url: `${baseUrl}/checkout/confirmation/${appState.activeOrder.code}`,
						},
					});
					if (confirmResult?.error) {
						store.error = confirmResult.error.message as string;
						return;
					}
				})}
			>
				<CreditCardIcon />
				<span>
					{_`Pay ${(appState.activeOrder.totalWithTax / 100).toFixed(2)} ${appState.activeOrder.currencyCode}`}
				</span>
			</button>
		</div>
	);
});
