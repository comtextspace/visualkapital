<script lang="ts">
	const volumes = [
		{
			id: 'tom-1',
			title: 'Том I. Процесс производства капитала',
			themes: [
				{
					href: '/tom-1/stoimost',
					title: 'Стоимость и прибавочная стоимость',
					description: 'W = c + v + m, норма прибавочной стоимости, органическое строение капитала.'
				},
				{
					href: '/tom-1/proizvoditelnost',
					title: 'Производительность труда и стоимость товара',
					description:
						'Как рост производительности снижает стоимость отдельной штуки при неизменной сумме новой стоимости за день.'
				},
				{
					href: '/tom-1/chislo-rabochih',
					title: 'Масса прибавочной стоимости и число рабочих',
					description: 'M = L × m — масса прибавочной стоимости растёт с числом занятых рабочих.'
				},
				{
					href: '/tom-1/vidy-pribavochnoy-stoimosti',
					title: 'Абсолютная и относительная прибавочная стоимость',
					description:
						'Удлинение рабочего дня против сокращения необходимого времени — два способа увеличить m.'
				},
				{
					href: '/tom-1/izmenenie-stoimosti-rabochey-sily',
					title: 'Изменение стоимости рабочей силы и прибавочной стоимости',
					description:
						'Три закона: как длина дня, интенсивность и производительность труда по отдельности меняют v и m.'
				}
			]
		},
		{
			id: 'tom-2',
			title: 'Том II. Процесс обращения капитала',
			themes: [
				{
					href: '/tom-2/vremya-oborota',
					title: 'Время оборота и величина авансированного капитала',
					description:
						'K = k × (w + z) — чем короче оборот, тем меньше капитала нужно авансировать.'
				},
				{
					href: '/tom-2/vysvobozhdenie-kapitala',
					title: 'Высвобождение оборотного капитала',
					description:
						'Рабочий период равен, больше или меньше периода обращения — когда часть капитала временно не находит применения.'
				},
				{
					href: '/tom-2/prostoe-vosproizvodstvo',
					title: 'Простое воспроизводство',
					description:
						'v₁ + m₁ = c₂ — условие обмена между отделом средств производства и отделом предметов потребления.'
				}
			]
		}
	];
</script>

<svelte:head>
	<title>Капитал в формулах — интерактивные схемы</title>
	<meta
		name="description"
		content="Интерактивные схемы к «Капиталу» Карла Маркса: стоимость и прибавочная стоимость, кругооборот капитала."
	/>
</svelte:head>

<section class="mb-10">
	<div
		class="mb-6 max-w-prose rounded-lg border border-surplus/40 bg-surplus/5 px-4 py-3 text-sm text-ink-soft"
		role="note"
	>
		<strong class="text-surplus">Внимание:</strong> схемы, формулы и пояснения на этом сайте сгенерированы
		нейросетью. Это учебный эксперимент, а не выверенный академический материал — относитесь к содержанию
		критически и по возможности проверяйте по первоисточнику.
	</div>
	<h1 class="font-serif text-3xl">Капитал в формулах</h1>
	<p class="mt-3 max-w-prose text-ink-soft">
		Живые схемы к экономическим построениям Маркса. Подвигайте слайдер у одной величины — остальные
		посчитаются сами, по тем же формулам, что в тексте.
	</p>
</section>

<div class="space-y-10">
	{#each volumes as volume (volume.id)}
		<section>
			<h2 class="mb-3 font-serif text-xl">{volume.title}</h2>
			<ul class="grid gap-3 sm:grid-cols-2">
				{#each volume.themes as theme (theme.title)}
					<li>
						{#if theme.href}
							<a
								href={theme.href}
								class="block rounded-lg border border-ink/15 bg-paper-dark/40 p-4 transition hover:border-surplus/60 hover:bg-paper-dark/70"
							>
								<div class="font-serif text-lg">{theme.title}</div>
								<div class="mt-1 text-sm text-ink-soft">{theme.description}</div>
							</a>
						{:else}
							<div class="block rounded-lg border border-dashed border-ink/15 p-4 opacity-60">
								<div class="font-serif text-lg">{theme.title}</div>
								<div class="mt-1 text-sm text-ink-soft">{theme.description}</div>
							</div>
						{/if}
					</li>
				{/each}
			</ul>
		</section>
	{/each}
</div>
