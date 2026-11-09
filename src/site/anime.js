// Animações de scroll da landing feitas com Anime.js (v4).
// NÃO mexe no friso (faixa de frases) nem no templo: esses ficam com as animações próprias.
import { animate, createScope, onScroll, splitText, stagger, utils } from 'animejs'

// o elemento "entra" quando o topo dele chega a 14% acima do rodapé da tela
const ENTER = 'bottom-=14% top'

export function initAnime() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {}

  const scope = createScope().add(() => {
    /* 1) Título do topo: cada palavra sobe de dentro de uma "máscara" */
    const hero = document.querySelector('[data-hero-title]')
    if (hero) {
      const { words } = splitText(hero, { words: { wrap: 'clip' } })
      animate(words, { y: ['112%', '0%'], duration: 1100, ease: 'out(4)', delay: stagger(90, { start: 250 }) })
    }

    /* 2) Títulos das seções: palavra por palavra ao entrar na tela (como nas referências com título gigante) */
    utils.$('[data-split]').forEach((el) => {
      const { words } = splitText(el, { words: { wrap: 'clip' } })
      animate(words, {
        y: ['112%', '0%'],
        duration: 950,
        ease: 'out(4)',
        delay: stagger(65),
        autoplay: onScroll({ target: el, enter: ENTER, repeat: false }),
      })
    })

    /* 3) Grupos de cards e listas: entram em cascata */
    ;['.s-features', '.s-includes', '.s-faq-list', '.s-checks', '.s-price-steps'].forEach((sel) => {
      utils.$(sel).forEach((group) => {
        animate(Array.from(group.children), {
          opacity: [0, 1],
          y: [40, 0],
          duration: 900,
          ease: 'out(3)',
          delay: stagger(110),
          autoplay: onScroll({ target: group, enter: ENTER, repeat: false }),
        })
      })
    })

    /* 4) Foto do leitor: afasta o zoom conforme a seção atravessa a tela (acompanha o scroll) */
    const study = document.querySelector('.s-study')
    if (study) {
      animate('.s-study-img img', {
        scale: [1.3, 1],
        ease: 'linear',
        autoplay: onScroll({ target: study, enter: 'end start', leave: 'start end', sync: 0.4 }),
      })
    }

    /* 5) Botões da chamada final */
    const finalBtns = document.querySelector('.s-final .s-hero-cta')
    if (finalBtns) {
      animate(Array.from(finalBtns.children), {
        opacity: [0, 1],
        y: [24, 0],
        scale: [0.92, 1],
        duration: 800,
        ease: 'out(4)',
        delay: stagger(120),
        autoplay: onScroll({ target: finalBtns, enter: ENTER, repeat: false }),
      })
    }
  })

  return () => scope.revert()
}
