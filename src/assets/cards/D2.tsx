
export default function D2() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" className="card" height="3.5in" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="2.5in">
			<defs>
				<symbol id="SD2" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid">
					<path className="label-suit-red" d="M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z"></path>
				</symbol>
				<symbol id="VD2" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
					<path className="label-value-red" d="M-225 -225C-245 -265 -200 -460 0 -460C 200 -460 225 -325 225 -225C225 -25 -225 160 -225 460L225 460L225 300" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none"></path>
				</symbol>
			</defs>
			<rect className="rect" width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12"></rect>
					<use href="#VD2" height="32" width="32" x="-114.4" y="-156"></use>
					<use href="#SD2" height="26.769" width="26.769" x="-111.784" y="-119"></use>
					<use href="#SD2" height="70" width="70" x="-35" y="-135.501"></use>
			<g transform="rotate(180)">
					<use href="#VD2" height="32" width="32" x="-114.4" y="-156"></use>
					<use href="#SD2" height="26.769" width="26.769" x="-111.784" y="-119"></use>
					<use href="#SD2" height="70" width="70" x="-35" y="-135.501"></use>
			</g>
		</svg>
	);
}