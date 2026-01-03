import { component$ } from '@qwik.dev/core';
import { Order, Payment, Refund } from '~/generated/graphql';
import { formatPrice } from '~/utils';
import { Image } from '../image/image';

type IProps = {
	order: Order;
};

export default component$<IProps>(({ order }) => {
	const paid = order?.payments?.reduce((sum, payment) => sum + payment.amount, 0);
	const refunded = order?.payments?.reduce((orderSum: number, payment: Payment) => {
		const paymentRefunded = payment.refunds
			.filter((refund: Refund) => refund.state === 'Settled')
			.reduce((sum: number, refund: Refund) => sum + refund.total, 0);

		return orderSum + paymentRefunded;
	}, 0);

	return (
		<a href={`/account/orders/${order?.code}`} class="block">
			<div class="w-full p-6 bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition duration-300 flex flex-col hover:shadow-2xl hover:bg-gray-50 cursor-pointer">
				<div class="flex justify-between items-center mb-4">
					<p class="text-sm font-medium">
						Order: <span class="ml-2 text-lg font-semibold">{order?.code}</span>
					</p>
					<div class="flex items-center gap-2">
						<span
							class={`${
								order.state === 'Cancelled' ? 'bg-red-400' : 'bg-teal-400'
							} text-white text-xs px-2 py-1 inline-block rounded-full uppercase font-semibold tracking-wide`}
						>
							{order.state}
						</span>
					</div>
				</div>

				<div class="flex justify-between items-center mb-4">
					{order.lines.map((line) => (
						<div key={line.id} class="flex-shrink-0 w-32 h-32 mr-2">
							<Image
								layout="fixed"
								width={128}
								height={128}
								class="w-full h-full object-cover rounded-lg"
								src={line?.featuredAsset?.preview}
								alt={line.productVariant?.name}
							/>
						</div>
					))}

					{order.lines.length === 1 && (
						<div>
							<p class="text-base font-medium text-gray-800">
								{order.lines[0].productVariant.product.name}
							</p>
							<p class="text-sm text-gray-500">{order.lines[0].productVariant.name}</p>
						</div>
					)}

					<div class="relative flex flex-col items-end ml-auto h-32">
						<p class="text-lg font-semibold absolute top-1/2 transform -translate-y-1/2">
							{formatPrice(paid, order?.currencyCode || 'USD')}
						</p>
						{refunded && refunded > 0 ? (
							<span
								class="absolute bottom-0 right-0 bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full font-semibold tracking-wide whitespace-nowrap"
								title="Refunded"
							>
								+ {formatPrice(refunded, order?.currencyCode || 'USD')}
							</span>
						) : null}
					</div>
				</div>
			</div>
		</a>
	);
});
