// ════════════════════════════════════════════════════════════════
//  PORTFOLIO PROJECTS
// ════════════════════════════════════════════════════════════════
// One entry per project in the PORTFOLIO section on the front page.
// prosjekt.html?p=<id> renders the project view from this list.
//
//  id           matches the link on the front page (prosjekt.html?p=01)
//  tittel       project name
//  cover        card image (4:3); null shows an empty placeholder
//  coverLoop    optional: a short silent video that loops on the card,
//               over the cover image (which shows if it can't play)
//  coverLoopFit true: fit the loop whole instead of cropping it to 4:3
//  lenke        optional: the card goes here instead of a project view
//  beskrivelse  blocks in the left column, separated by thin lines;
//               \n in a text is a line break (\n\n leaves an empty line)
//  media        the right column, top to bottom. Each item is
//                 { type: 'bilde' | 'video', src, alt, format }
//               Videos autoplay muted on a loop, without controls, and only
//               load once they're scrolled near. `lyd: true` adds a small
//               sound button (bottom left) for videos that have audio.
//               `lydFraStart: true` starts it with that sound on (it falls
//               back to silent until the first click if the browser says no).
//               `kontroller: true` gives it the full player from Arbeid
//               instead (timeline, volume, fullscreen); it waits for a click.
//               or a side-by-side pair:
//                 { type: 'par', items: [ {...}, {...} ] }
//               `format` is the box shape (e.g. '16 / 9'). Without a src
//               the item shows as an empty placeholder in that shape.
//               or a magazine you page through, like the one on Arbeid:
//                 { type: 'magasin', tittel, mappe, sider }
//               `mappe` holds the pages as 00.jpg, 01.jpg … (00 is the
//               cover); `sider` is how many there are.

(function () {
    const dir = 'portfolio-files/01-rubix-curve';

    const rubix = {
        id: '01',
        tittel: 'Rubix Curve',
        cover: `${dir}/cover.jpg?v=2`,
        beskrivelse: [
            { label: 'Oppgave', tekst: 'Utvikle en skrifttype basert på så få moduler som mulig.' },
            { label: 'Konsept', tekst: 'Rubix Curve er en modulbasert egenlaget display-font utviklet i Glyphs. Hver eneste bokstav er bygget av bare to former – et kvadrat og et kvadrat med ett avrundet hjørne – brukt i 100%, 2/3 og 5% størrelse. Det gir fonten en stram, konstruert logikk, mens de runde hjørnene gjør den myk og vennlig.' },
            { label: 'Konstruksjon', tekst: 'Bokstavene settes sammen i et 2\u00d72-rutenett, med enkelte unntak i 3\u00d73 der lesbarheten krever det. Alle tegn er optisk justert, og avstanden mellom bokstavene er like stor som åpningene inne i dem, slik at ord og setninger står som tette, jevne blokker. Versjon 2 kommer i Bold, med et fullt tegnsett fra A til Å, tall og skilletegn.' },
        ],
        media: [
            { type: 'bilde', src: `${dir}/01-tittel.png`,       format: '8 / 3',  alt: 'Navnet Rubix Curve satt i fonten, v.2, ©2026' },
            { type: 'video', src: `${dir}/showcase.mp4?v=2`,        format: '16 / 9', lyd: true, lydFraStart: true, alt: 'Animert presentasjon av fonten Rubix Curve' },
            { type: 'bilde', src: `${dir}/02-konstruksjon.jpg`, format: '4 / 3',  alt: 'Konstruksjonstegning av bokstaven A med mål, x-høyde og grunnlinje' },
            { type: 'bilde', src: `${dir}/03-moduler.jpg`,      format: '4 / 3',  alt: 'De to modulene og 2×2-rutenettet som bokstavene bygges av' },
            { type: 'bilde', src: `${dir}/04-tegnsett.png`,     format: '16 / 9', alt: 'Hele tegnsettet: bokstaver med Æ, Ø og Å, tall og skilletegn' },
            { type: 'bilde', src: `${dir}/05-rubix.jpg`,        format: '2000 / 844', alt: 'Ordet RUBIX tegnet som omriss på et blått rutenett' },
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
        {
            id: '02',
            tittel: 'App',
            cover: 'portfolio-files/02-app/cover.jpg?v=3',
            beskrivelse: [
                { label: 'Oppgave', tekst: 'Design et interaktivt uttrykk knyttet til temaet «Unsustainability».' },
                { label: 'Idé', tekst: 'En statlig eid app som holder oversikt over utslippene dine – og gir deg fordeler jo mer miljøvennlig du lever.' },
                { label: 'Utførelse', tekst: 'Appen er designet i Figma på under tre uker. Den bygger på et poengsystem der −100 tilsvarer utslippene til en gjennomsnittlig person, 0 er nøytralt, og +100 betyr at du bidrar like mye som en gjennomsnittlig person forurenser. Jo høyere poengsum, desto flere fordeler får du – som billigere kollektivtransport, billigere grønn energi og fordeler ved andre miljøvennlige valg. Appen gir deg også tips, statistikk, personliggjøring og oppdateringer.\n\nDet siste bildet viser grafer og andre UI-elementer som ikke ble med i den ferdige appen.' },
            ],
            media: [
                { type: 'video', src: 'portfolio-files/02-app/app-demo.mp4', kontroller: true, alt: 'Skjermopptak av app-prototypen: forside, grafer og oversikt over vann, CO2 og energi' },
                { type: 'bilde', src: 'portfolio-files/02-app/komponenter.png', format: '1590 / 1132', alt: 'UI-elementer som ikke ble med i den ferdige appen: grafer, søyler og målere for vann, CO2 og energi' },
            ],
        },
        {
            ...plassholder('03', 'Magazines'),
            cover: 'portfolio-files/03-magazines/cover.jpg?v=1',
            beskrivelse: [
                { label: 'Konsept', tekst: 'Personlige prosjekter fra 2023. Jeg kom opp med konsept, layout, typografi og det visuelle uttrykket. Bildene er hentet fra nettet.' },
                { label: 'Resultat', tekst: 'Begge magasinene er trykket i flere fysiske eksemplarer. De var også med i opptaksprøven min til Fakultet for kunst, musikk og design, der jeg studerer i dag – og en av grunnene til at jeg kom inn.' },
            ],
            media: [
                { type: 'magasin', tittel: 'Her Loss', mappe: 'arbeid-files/Her Loss Magasin', sider: 62 },
                { type: 'magasin', tittel: 'Stylish',  mappe: 'arbeid-files/Stylish',          sider: 50 },
            ],
        },
        {
            id: '04',
            tittel: 'Motion Video',
            cover: 'portfolio-files/04-motion-video/cover.jpg?v=3',
            coverLoop: 'portfolio-files/04-motion-video/cover-loop.mp4?v=3',
            beskrivelse: [
                { label: 'Konsept', tekst: 'Personlig prosjekt fra 2025 der målet var å lære mest mulig om After Effects. Ved å lage denne promovideoen lærte jeg utrolig mye om hvordan After Effects fungerer og er bygget opp, og hvordan man kan bruke det.' },
            ],
            media: [
                { type: 'video', src: 'video-files/Motion%20Graphics/promo-video.mp4', format: '16 / 9', kontroller: true, alt: 'Promovideo for Sway Design med animert typografi' },
                { type: 'video', src: 'portfolio-files/04-motion-video/after-effects-prosess.mp4', kontroller: true, alt: 'Skjermopptak fra After Effects: tidslinjen og lagene bak animasjonen' },
            ],
        },
        {
            id: '05',
            tittel: 'Video',
            cover: 'portfolio-files/05-video/cover.jpg?v=1',
            coverLoop: 'portfolio-files/05-video/cover-loop.mp4?v=1',
            coverLoopFit: true,
            beskrivelse: [
                { label: 'Konsept', tekst: 'Personlig prosjekt for å gjøre en idé til virkelighet. Jeg hadde en klar visjon for introen, med den røde teksten og det retro uttrykket. Introen trengte noe å bli etterfulgt av, så jeg fikk bruke videomateriale fra Tobias Sjåfjell som jeg klippet inn.' },
                { label: 'Sang', tekst: 'Icon – Jaden & STAY HERE 4 LIFE (feat. Brent Faiyaz)' },
            ],
            media: [
                { type: 'video', src: 'video-files/Videoredigering/balestrand-open-sinners-edit.mp4', format: '16 / 9', kontroller: true, alt: 'Balestrand Open 2025: ski og snowboard i fjellet' },
            ],
        },
        { ...plassholder('06', 'Posters'), cover: 'portfolio-files/06-posters/cover.jpg?v=3', lenke: 'arbeid.html#plakatdesign' },
    ];
})();
