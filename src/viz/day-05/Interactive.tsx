'use client'
// Day 5: the isotype. One plain icon per unit, drawn in CSS (no photographs). Tab enters the icons, arrow keys move,
// Enter or a tap opens the item; "Show as a list" swaps the icons for a plain list. The static HTML shows every icon.
import { useState } from 'react'
import { useRovingFocus } from '@/lib/viz/roving'
import { Sourced } from '@/viz/kits/days-01-07/Parts'
import type { Item } from './select'
import s from './day05.module.css'

const confClass: Record<string, string> = { high: s.solid, medium: s.hollow, low: s.dashed, conflict: s.hollow }

export function Isotype({ items, agent, labels }: { items: Item[]; agent: { name: string; role: string } | null; labels: Record<string, string> }) {
  const [asList, setAsList] = useState(false)
  const flat = items.flatMap((it) => Array.from({ length: it.icons }, (_, k) => ({ it, k })))
  const [open, setOpen] = useState<number | null>(null)
  const roving = useRovingFocus(flat.length, { onSelect: (i) => setOpen(i), onExit: () => setOpen(null) })
  const openItem = open !== null ? flat[open]?.it : null

  return (
    <div className={s.isoWrap}>
      <div className={s.toolbar}>
        <button type="button" className={s.btn} aria-pressed={asList} onClick={() => setAsList(!asList)}>
          Show as a list
        </button>
      </div>
      {asList ? (
        <ul className={s.list}>
          {items.map((it) => (
            <li key={it.id}>
              <strong className="num">{it.icons}</strong> {it.countReported ? '' : '(count not reported) '}
              {it.name}. {it.detail} <Sourced level={it.level} refs={it.refs} labels={labels} />
            </li>
          ))}
        </ul>
      ) : (
        <div className={s.groups} onKeyDown={roving.onKeyDown} role="group" aria-label="Items agents found, one icon per unit. Use the arrow keys to move and Enter to open.">
          {items.map((it) => (
            <section key={it.id} className={s.group} aria-label={`${it.countReported ? it.icons : 'One'} ${it.name}`}>
              <h3 className={s.groupHead}>
                {it.id === 'cash' ? <span className={s.big}>{it.detail.split(' ')[0]}</span> : it.countReported ? <span className={s.big}>{it.icons}</span> : null}
                <span className={s.groupName}>{it.name}</span>
              </h3>
              <div className={s.icons}>
                {flat.map((f, i) =>
                  f.it.id === it.id ? (
                    <button
                      key={i}
                      type="button"
                      data-roving-index={i}
                      tabIndex={roving.tabIndexFor(i)}
                      className={`${s.icon} ${s[f.it.id]} ${confClass[f.it.level]} ${open === i ? s.iconOpen : ''}`}
                      aria-label={`${f.it.name}, icon ${f.k + 1} of ${f.it.icons}: one icon is ${f.it.perIcon}`}
                      aria-expanded={open === i}
                      onClick={() => {
                        roving.setActive(i)
                        setOpen(open === i ? null : i)
                      }}
                      onFocus={() => roving.setActive(i)}
                    />
                  ) : null,
                )}
              </div>
              <p className={s.key}>1 icon = {it.perIcon}</p>
            </section>
          ))}
        </div>
      )}
      <div className={s.detail} aria-live="polite">
        {openItem ? (
          <>
            <p className={s.detailItem}>{openItem.detail}</p>
            {agent ? (
              <p className={s.detailWho}>
                Listed in court by {agent.name}
                {agent.role ? `, ${agent.role.charAt(0).toLowerCase()}${agent.role.slice(1)}` : ''}.
              </p>
            ) : null}
            <Sourced level={openItem.level} refs={openItem.refs} labels={labels} />
          </>
        ) : (
          <p className={s.detailHint}>Focus or tap an icon for the item, the agent who listed it, and the source.</p>
        )}
      </div>
    </div>
  )
}
