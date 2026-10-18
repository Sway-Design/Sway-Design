// ════════════════════════════════════════════════════════════════
//  PORTFOLIO PROJECTS
// ════════════════════════════════════════════════════════════════
// One entry per project in the PORTFOLIO section on the front page.
// prosjekt.html?p=<id> renders the project view from this list.
//
//  id           matches the link on the front page (prosjekt.html?p=01)
//  tittel       project name
//  cover        card image (4:3); null shows an empty placeholder
//  beskrivelse  blocks in the left column, separated by thin lines
//  media        the right column, top to bottom. Each item is
//                 { type: 'bilde' | 'video', src, alt, format }
//               Videos autoplay muted on a loop, without controls, and only
//               load once they're scrolled near. `lyd: true` adds a small
//               sound button (bottom left) for videos that have audio.
//               or a side-by-side pair:
//                 { type: 'par', items: [ {...}, {...} ] }
//               `format` is the box shape (e.g. '16 / 9'). Without a src
//               the item shows as an empty placeholder in that shape.

(function () {
    const dir = 'portfolio-files/01-rubix-curve';

    const rubix = {
        id: '01',
        tittel: 'Rubix Curve',
        cover: `${dir}/cover.jpg?v=2`,
        beskrivelse: [
            { label: 'Konsept', tekst: 'Rubix Curve er en modulbasert egenlaget display-font utviklet i Glyphs. Hver eneste bokstav er bygget av bare to former – et kvadrat og et kvadrat med ett avrundet hjørne – brukt i 100%, 2/3 og 5% størrelse. Det gir fonten en stram, konstruert logikk, mens de runde hjørnene gjør den myk og vennlig.' },
            { label: 'Konstruksjon', tekst: 'Bokstavene settes sammen i et 2\u00d72-rutenett, med enkelte unntak i 3\u00d73 der lesbarheten krever det. Alle tegn er optisk justert, og avstanden mellom bokstavene er like stor som åpningene inne i dem, slik at ord og setninger står som tette, jevne blokker. Versjon 2 kommer i Bold, med et fullt tegnsett fra A til Å, tall og skilletegn.' },
        ],
        media: [
            { type: 'bilde', src: `${dir}/01-tittel.png`,       format: '8 / 3',  alt: 'Navnet Rubix Curve satt i fonten, v.2, ©2026' },
            { type: 'video', src: `${dir}/showcase.mp4?v=2`,        format: '16 / 9', lyd: true, alt: 'Animert presentasjon av fonten Rubix Curve' },
            { type: 'bilde', src: `${dir}/02-konstruksjon.jpg`, format: '4 / 3',  alt: 'Konstruksjonstegning av bokstaven A med mål, x-høyde og grunnlinje' },
            { type: 'bilde', src: `${dir}/03-moduler.jpg`,      format: '4 / 3',  alt: 'De to modulene og 2×2-rutenettet som bokstavene bygges av' },
            { type: 'bilde', src: `${dir}/04-tegnsett.png`,     format: '16 / 9', alt: 'Hele tegnsettet: bokstaver med Æ, Ø og Å, tall og skilletegn' },
            { type: 'bilde', src: `${dir}/05-rubix.png`,        format: '4 / 3',  alt: 'Ordet RUBIX tegnet som omriss på et blått rutenett' },
            { type: 'bilde', src: `${dir}/06-setning.jpg`,      format: '16 / 9', alt: '«The quick brown fox jumps over the lazy dog» satt i fonten, med håndskrevne kommentarer' },
        ],
    };

    // Empty slots until the real projects are in — named for what goes there.
    const plassholder = (id, tittel) => ({
        id,
        tittel,
        cover: null,
        beskrivelse: [
            { label: 'Kunde', tekst: 'Hvem prosjektet ble laget for — eller «Eget prosjekt».' },
            { label: 'Konsept', tekst: 'Hva oppgaven var, hvordan du tenkte og hva du endte opp med. To–tre setninger holder.' },
            { label: 'Min rolle', tekst: 'Hva du gjorde selv: design, layout, foto, animasjon, klipp\u00a0…' },
        ],
        media: [
            { type: 'bilde', format: '16 / 9' },
            { type: 'bilde', format: '3 / 2' },
            { type: 'par', items: [
                { type: 'bilde', format: '4 / 5' },
                { type: 'bilde', format: '4 / 5' },
            ] },
            { type: 'video', format: '16 / 9' },
            { type: 'bilde', format: '21 / 9' },
        ],
    });

    window.PROSJEKTER = [
        rubix,
        plassholder('02', 'App'),
        { ...plassholder('03', 'Magazines'), cover: 'portfolio-files/03-magazines/cover.jpg?v=1' },
        plassholder('04', 'Motion Video'),
        plassholder('05', 'Video'),
        { ...plassholder('06', 'Posters'), cover: 'portfolio-files/06-posters/cover.jpg?v=3' },
    ];
})();
