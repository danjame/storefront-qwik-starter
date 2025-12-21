import { $, component$, useContext, useVisibleTask$ } from '@qwik.dev/core';
import { _ } from 'compiled-i18n';
import { APP_STATE, CUSTOMER_NOT_DEFINED_ID } from '~/constants';
import { logoutMutation } from '~/providers/shop/account/account';
import { getActiveCustomerQuery } from '~/providers/shop/customer/customer';
import LogoutIcon from '../icons/LogoutIcon';
import MenuIcon from '../icons/MenuIcon';
import ShoppingBagIcon from '../icons/ShoppingBagIcon';
import UserIcon from '../icons/UserIcon';
import { LanguageDropdown } from '../language-dropdown/LanguageDropdown';
import SearchBar from '../search-bar/SearchBar';

export default component$(() => {
	const appState = useContext(APP_STATE);
	const collections = useContext(APP_STATE).collections.filter(
		(item) => item.parent?.name === '__root_collection__' && !!item.featuredAsset
	);

	const totalQuantity =
		appState.activeOrder?.state !== 'PaymentAuthorized'
			? appState.activeOrder?.totalQuantity || 0
			: 0;

	useVisibleTask$(async () => {
		if (appState.customer.id === CUSTOMER_NOT_DEFINED_ID) {
			const activeCustomer = await getActiveCustomerQuery();
			if (activeCustomer) {
				appState.customer = {
					title: activeCustomer.title ?? '',
					firstName: activeCustomer.firstName,
					id: activeCustomer.id,
					lastName: activeCustomer.lastName,
					emailAddress: activeCustomer.emailAddress,
					phoneNumber: activeCustomer.phoneNumber ?? '',
				};
			}
		}
	});

	const logout = $(async () => {
		await logoutMutation();
		// force hard refresh
		window.location.href = '/';
	});

	return (
		<div
			class={`bg-gradient-to-r from-white to-white transform shadow-xl sticky top-0 z-10 animate-dropIn`}
		>
			<header>
				<div class="bg-gray-700 text-white shadow-inner text-center text-sm py-1 px-2 xl:px-0">
					<div class="max-w-6xl mx-2 h-5 min-h-full md:mx-auto flex items-center justify-between my-1">
						<div class="flex justify-between items-center w-full">
							<div>
								<p class="hidden sm:block">
									{_`Explore the full details on our`}{' '}
									<a href="https://pt.lotactree.com" target="_blank" class="underline">
										{_`official website`}
									</a>
								</p>
							</div>
							<div class="flex mr-[10px] 2xl:mr-0">
								<LanguageDropdown />
								<a
									href={appState.customer.id !== CUSTOMER_NOT_DEFINED_ID ? '/account' : '/sign-in'}
									class="flex items-center space-x-1 pb-1 pr-2"
								>
									<UserIcon />
									<span class="mt-1 text-white">
										{appState.customer.id !== CUSTOMER_NOT_DEFINED_ID ? _`My Account` : _`Sign In`}
									</span>
								</a>
								{appState.customer.id !== CUSTOMER_NOT_DEFINED_ID && (
									<button onClick$={logout} class="text-white">
										<div class="flex items-center cursor-pointer">
											<span class="mr-2">{_`Logout`}</span>
											<LogoutIcon />
										</div>
									</button>
								)}
							</div>
						</div>
					</div>
				</div>
				<div class="max-w-6xl mx-auto p-4 flex items-center space-x-4">
					<button
						class="block sm:hidden text-stone-700"
						onClick$={() => (appState.showMenu = !appState.showMenu)}
					>
						<span class="sr-only">Menu</span>
						<MenuIcon />
					</button>
					<h1 class="text-white w-35">
						<a href="/">
							<img src={`/lotactree_logo.avif`} width={120} height={93} alt="Lotactree Logo" />
						</a>
					</h1>
					<div class="hidden space-x-4 sm:block">
						{collections.map((collection) => (
							<a
								class="text-sm md:text-base text-stone-700 transition-colors duration-200 hover:text-green-600"
								href={`/collections/${collection.slug}`}
								key={collection.id}
							>
								{collection.name}
							</a>
						))}
					</div>
					<div class="flex-1 block md:pr-8">
						<SearchBar />
					</div>
					<div class="">
						<button
							name="Cart"
							aria-label={`${totalQuantity} items in cart`}
							class="relative w-9 h-9 bg-white bg-opacity-20 rounded text-stone-700 p-1"
							onClick$={() => (appState.showCart = !appState.showCart)}
						>
							<ShoppingBagIcon />
							{totalQuantity ? (
								<div class="absolute rounded-full -top-2 -right-2 bg-primary-600 w-6 h-6">
									{totalQuantity}
								</div>
							) : (
								''
							)}
						</button>
					</div>
				</div>
			</header>
		</div>
	);
});
