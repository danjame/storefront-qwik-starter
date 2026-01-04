import { $, component$, useSignal, useStore, useVisibleTask$ } from '@qwik.dev/core';
import { useLocation } from '@qwik.dev/router';
import { _ } from 'compiled-i18n';
import { Image } from '~/components/image/image';
import { Modal } from '~/components/modal/Modal';
import ReviewForm from '~/components/review-form/ReviewForm';
import { Order, OrderLine, Payment, Refund } from '~/generated/graphql';
import { getOrderByCodeQuery } from '~/providers/shop/orders/order';
import { createReviewMutation, getReviewQuery } from '~/providers/shop/reviews/reviews';
import { formatDateTime, formatPrice } from '~/utils';

export default component$(() => {
	const {
		params: { code },
	} = useLocation();
	const store = useStore<{ order?: Order }>({});

	const reviewedByLineId = useStore<Record<string, boolean>>({});
	useVisibleTask$(async () => {
		store.order = await getOrderByCodeQuery(code);
		if (!store.order) return;

		const promises = store.order.lines.map((line) => getReviewQuery(store.order!.id, line.id));
		const results = await Promise.all(promises);
		store.order.lines.forEach((line, index) => {
			reviewedByLineId[line.id] = !!results[index];
		});
	});

	const order = store.order;
	const subtotal =
		order?.lines?.reduce((orderSum: number, line: OrderLine) => {
			const lineSubtotal = line.productVariant.price * line.orderPlacedQuantity;
			return orderSum + lineSubtotal;
		}, 0) ?? 0;

	const linesTax =
		order?.lines?.reduce((taxSum: number, line: OrderLine) => {
			const lineTax =
				(line.unitPriceWithTax - line.productVariant.price) * line.orderPlacedQuantity;
			return taxSum + lineTax;
		}, 0) ?? 0;

	const refunded = order?.payments?.reduce((orderSum: number, payment: Payment) => {
		const paymentRefunded = payment.refunds
			.filter((refund: Refund) => refund.state === 'Settled')
			.reduce((sum: number, refund: Refund) => sum + refund.total, 0);

		return orderSum + paymentRefunded;
	}, 0);

	const visible = useSignal(false);
	const selectedLineId = useSignal('');
	const reviewForm = useStore({
		rating: 0,
		comment: '',
	});

	const onSubmit = $(() => {
		if (store.order) {
			createReviewMutation({
				productVariantId: selectedLineId.value,
				orderId: store.order.id,
				...reviewForm,
			}).then(() => {
				visible.value = false;
				window.location.reload();
			});
		}
	});

	const onCancel = $(() => {
		visible.value = false;
		reviewForm.rating = 0;
		reviewForm.comment = '';
	});

	return order ? (
		<div class="max-w-6xl m-auto rounded-lg p-4 space-y-4 text-gray-900">
			<div>
				<h2 class="mb-2 flex items-center justify-between">
					<span>
						{_`Order`} <span class="text-xl font-semibold">{order.code}</span>
					</span>
					<span
						class={`${
							order.state === 'Cancelled' ? 'bg-red-400' : 'bg-teal-400'
						} text-white text-xs px-2 py-1 inline-block rounded-full uppercase font-semibold tracking-wide`}
					>
						{order.state}
					</span>
				</h2>
				<p class="mb-4">
					{_`Placed on`}{' '}
					<span class="text-xl font-semibold">{formatDateTime(order.createdAt)}</span>
				</p>
				<ul class="divide-y divide-gray-200">
					{order.lines.map((line, key) => {
						return (
							<li key={key} class="py-6 flex">
								<div class="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
									<Image
										layout="fixed"
										width={100}
										height={100}
										aspectRatio={1}
										class="rounded object-cover max-w-max h-full"
										src={line.featuredAsset?.preview}
									/>
								</div>
								<div class="ml-4 flex-1 flex flex-col">
									<div>
										<div class="flex justify-between text-base font-medium">
											<h3>{line.productVariant.name}</h3>
											<p class="ml-4 px-2">
												{formatPrice(line.productVariant.price, order.currencyCode || 'USD')}
											</p>
										</div>
									</div>
									<div class="flex-1 flex items-center justify-between text-sm text-gray-600">
										<div class="flex space-x-4">
											<div class="qty">{line.orderPlacedQuantity}</div>
										</div>
										<div class="total px-2">
											<div>
												{formatPrice(
													line.productVariant.price * line.orderPlacedQuantity,
													order.currencyCode || 'USD'
												)}
											</div>
										</div>
									</div>
									{order.state === 'Delivered' && (
										<div class="flex-1 flex items-end justify-end text-gray-600">
											<button
												class={`flex items-center justify-around bg-gray-100 border rounded-md py-1 px-2 text-sm font-medium text-black focus:outline-none ${reviewedByLineId[line.id] ? '' : 'hover:bg-gray-300'}`}
												disabled={reviewedByLineId[line.id]}
												onClick$={() => {
													visible.value = true;
													selectedLineId.value = line.id;
												}}
											>
												{reviewedByLineId[line.id] ? _`Reviewed` : _`Review`}
											</button>
										</div>
									)}
								</div>
							</li>
						);
					})}
				</ul>
			</div>
			<dl class="border-t mt-6 border-gray-200 py-6 space-y-6">
				<div class="flex items-center justify-between">
					<dt class="text-sm">{_`Subtotal`}</dt>
					<dd class="text-sm font-medium px-2">
						{formatPrice(subtotal, order.currencyCode || 'USD')}
					</dd>
				</div>
				<div class="flex items-center justify-between">
					<dt class="text-sm">
						{_`Shipping`}{' '}
						<span class="text-gray-600">
							(<span>{_`Standard Shipping`}</span>)
						</span>
					</dt>
					<dd class="text-sm font-medium px-2">
						{formatPrice(order.shippingWithTax, order.currencyCode || 'USD')}
					</dd>
				</div>
				<div class="flex items-center justify-between">
					<dt class="text-sm">{_`Tax`}</dt>
					<dd class="text-sm font-medium px-2">
						{formatPrice(linesTax, order.currencyCode || 'USD')}
					</dd>
				</div>
				<div class="flex items-center justify-between border-t border-gray-200 pt-6">
					<dt class="text-base font-medium">{_`Total`}</dt>
					<dd class="text-base font-medium px-2">
						{formatPrice(subtotal + linesTax + order.shippingWithTax, order.currencyCode || 'USD')}
					</dd>
				</div>
				{refunded && refunded > 0 ? (
					<div class="flex items-center justify-between">
						<dt class="text-base font-medium text-gray-400">{_`Refunded`}</dt>
						<dd class="text-base font-medium px-2 text-gray-400">
							{formatPrice(refunded, order.currencyCode || 'USD')}
						</dd>
					</div>
				) : null}
			</dl>
			<div class="w-full bg-gray-100 p-8">
				<p class="mb-4 text-gray-600">{_`Shipping Address`}</p>
				<p class="text-base font-medium">{order.shippingAddress?.fullName}</p>
				<p class="text-base font-medium">{order.shippingAddress?.streetLine1}</p>
				<p class="text-base font-medium">{order.shippingAddress?.city}</p>
				<p class="text-base font-medium">{order.shippingAddress?.province}</p>
			</div>
			<Modal
				title="Rate & Review"
				open={visible.value}
				onCancel$={onCancel}
				onSubmit$={onSubmit}
				showIcon={false}
			>
				<div q:slot="modalContent" class="w-full min-w-0">
					<ReviewForm form={reviewForm} />
				</div>
			</Modal>
		</div>
	) : (
		<div class="h-[100vh]" />
	);
});
