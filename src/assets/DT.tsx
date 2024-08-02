
export default function DT() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" className="card" height="3.5in" preserveAspectRatio="none" viewBox="-120 -168 240 336" width="2.5in">
			<defs>
				<symbol id="SDT" viewBox="-600 -600 1200 1200" preserveAspectRatio="xMinYMid">
					<path className="label-suit-red" d="M-400 0C-350 0 0 -450 0 -500C0 -450 350 0 400 0C350 0 0 450 0 500C0 450 -350 0 -400 0Z"></path>
				</symbol>
				<symbol id="VDT" viewBox="-500 -500 1000 1000" preserveAspectRatio="xMinYMid">
					<path className="label-value-red" d="M-260 430L-260 -430M-50 0L-50 -310A150 150 0 0 1 250 -310L250 310A150 150 0 0 1 -50 310Z" stroke-width="80" stroke-linecap="square" stroke-miterlimit="1.5" fill="none"></path>
				</symbol>
			</defs>
			<rect className="rect" width="239" height="335" x="-119.5" y="-167.5" rx="12" ry="12"></rect>
					<use href="#VDT" height="32" width="32" x="-114.4" y="-156"></use>
					<use href="#SDT" height="26.769" width="26.769" x="-111.784" y="-119"></use>
					<use href="#SDT" height="70" width="70" x="-87.501" y="-135.501"></use>
					<use href="#SDT" height="70" width="70" x="17.501" y="-135.501"></use>
					<use href="#SDT" height="70" width="70" x="-87.501" y="-68.5"></use>
					<use href="#SDT" height="70" width="70" x="17.501" y="-68.5"></use>
					<use href="#SDT" height="70" width="70" x="-35" y="-102"></use>
			<g transform="rotate(180)">
					<use href="#VDT" height="32" width="32" x="-114.4" y="-156"></use>
					<use href="#SDT" height="26.769" width="26.769" x="-111.784" y="-119"></use>
					<use href="#SDT" height="70" width="70" x="-87.501" y="-135.501"></use>
					<use href="#SDT" height="70" width="70" x="17.501" y="-135.501"></use>
					<use href="#SDT" height="70" width="70" x="-87.501" y="-68.5"></use>
					<use href="#SDT" height="70" width="70" x="17.501" y="-68.5"></use>
					<use href="#SDT" height="70" width="70" x="-35" y="-102"></use>
			</g>
		</svg>
	);
}