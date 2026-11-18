"use client";
import { useState } from "react";
import { buildQuizProfile, QUESTIONS, type Answers } from "@/lib/quiz";
import type { Profile } from "@/lib/schemas";

type Props = { onDone: (profile: Profile, answers: Answers, height: string) => void; onExit: () => void };

const PART_CLASS = { Color: "c1", Body: "c2", Essence: "c3" } as const;

export default function Quiz({ onDone, onExit }: Props) {
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const q = QUESTIONS[i];
  const pct = Math.round((i / QUESTIONS.length) * 100);
  const firstOfPart = i === 0 || QUESTIONS[i - 1].part !== q.part;

  function choose(idx: number) {
    const next = { ...answers, [q.id]: idx };
    setAnswers(next);
    if (i + 1 < QUESTIONS.length) {
      setTimeout(() => setI(i + 1), 160);
    } else {
      const height = QUESTIONS.find((x) => x.id === "height")!.options[next.height ?? 1].label;
      onDone(buildQuizProfile(next), next, height);
    }
  }

  return (
    <div style={{ paddingTop: 14 }}>
      <div className="row between">
        <button className="linkish small" onClick={() => (i === 0 ? onExit() : setI(i - 1))}>← Back</button>
        <span className="muted small">{i + 1} of {QUESTIONS.length}</span>
      </div>
      <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${pct}%` }} /></div>
      <span className={`badge part ${PART_CLASS[q.part]}`}>{q.part}{firstOfPart && q.part !== "Color" ? " · new section" : ""}</span>
      <h2 style={{ fontSize: 30, marginTop: 12 }}>{q.text}</h2>
      {q.help && <p className="muted">{q.help}</p>}
      <div className="answers">
        {q.options.map((o, idx) => (
          <button key={o.label} className={`answer${answers[q.id] === idx ? " on" : ""}`} onClick={() => choose(idx)}>
            {o.swatch && <span className="sw" style={{ background: o.swatch }} />}
            <span>{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
