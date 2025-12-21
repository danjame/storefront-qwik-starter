import { $, component$, useSignal } from '@qwik.dev/core';
import { getLocale, Locale, locales } from 'compiled-i18n';

export const LanguageDropdown = component$(() => {
	const open = useSignal(false);
	const selected = useSignal(getLocale());
	const LABELS = {
		en: 'English',
		pt: 'Português',
		es: 'Español',
		fr: 'Français',
		de: 'Deutsch',
	} as const;

	const select = $((locale: Locale) => {
		selected.value = locale;
		document.cookie = `lang=${selected.value}; path=/; max-age=${60 * 60 * 24 * 365}`;
		open.value = false;
		location.reload();
	});

	return (
		<div class="relative inline-block text-left">
			{/* Button */}
			<button
				type="button"
				onClick$={() => (open.value = !open.value)}
				class="inline-flex items-center justify-between w-32 px-4 py-2 text-white text-sm font-medium text-gray-700 focus:outline-none"
			>
				{LABELS[selected.value as keyof typeof LABELS]}
				<svg
					class={`ml-2 h-4 w-4 transition-transform ${open.value ? 'rotate-180' : ''}`}
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			{/* Dropdown */}
			{open.value && (
				<div class="absolute right-0 mt-1 w-32 origin-top-right py-2 bg-gray-700 text-white divide-y divide-gray-600 rounded-lg z-20 animate-fade-in">
					{locales.map((locale) => (
						<button
							onClick$={() => select(locale)}
							class="w-full text-left px-4 py-2 text-sm hover:bg-gray-500"
							key={locale}
						>
							{LABELS[locale as keyof typeof LABELS]}
						</button>
					))}
				</div>
			)}
		</div>
	);
});
