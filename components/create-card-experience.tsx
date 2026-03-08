"use client";

import dynamic from "next/dynamic";
import { FormEvent, useMemo, useState } from "react";
import { DEFAULT_CARD_TEXT, MAX_CARD_TEXT_LENGTH } from "@/lib/cards";

const CardScene = dynamic(
  () => import("@/components/card-scene").then((module) => module.CardScene),
  {
    ssr: false,
    loading: () => (
      <div className="sceneLoading">Подготавливаем интерактивную открытку...</div>
    ),
  },
);

interface CreateCardResponse {
  card: {
    id: string;
  };
  shareUrl: string;
}

function isCreateCardResponse(
  payload: CreateCardResponse | { error?: string },
): payload is CreateCardResponse {
  return "shareUrl" in payload;
}

export function CreateCardExperience() {
  const [text, setText] = useState(DEFAULT_CARD_TEXT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const previewText = useMemo(() => {
    const normalized = text.trim();
    return normalized || "Здесь появится текст открытки";
  }, [text]);

  const charactersLeft = MAX_CARD_TEXT_LENGTH - text.length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setCopied(false);

    try {
      const response = await fetch("/api/cards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      const payload = (await response.json()) as
        | CreateCardResponse
        | { error?: string };

      if (!response.ok) {
        throw new Error(
          "error" in payload && payload.error
            ? payload.error
            : "Не удалось создать открытку.",
        );
      }

      if (!isCreateCardResponse(payload)) {
        throw new Error("Сервер вернул неполный ответ.");
      }

      setShareUrl(payload.shareUrl);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Не удалось создать открытку.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (!shareUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      setErrorMessage("Не удалось скопировать ссылку. Скопируйте ее вручную.");
    }
  }

  return (
    <main className="pageShell">
      <section className="contentPanel contentPanel--form">
        <p className="eyebrow">Конструктор поздравления</p>
        <h1 className="pageTitle">Создайте открытку и поделитесь ссылкой</h1>
        <p className="pageDescription">
          Напишите поздравление, сохраните его в базе и отправьте готовую ссылку.
          Получатель откроет открытку по адресу вида <code>/cards/&lt;id&gt;</code>.
        </p>

        <form className="cardForm" onSubmit={handleSubmit}>
          <label className="fieldLabel" htmlFor="card-text">
            Текст открытки
          </label>
          <textarea
            id="card-text"
            className="textArea"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setShareUrl("");
              setCopied(false);
            }}
            maxLength={MAX_CARD_TEXT_LENGTH}
            rows={8}
            placeholder="Напишите теплое поздравление..."
          />

          <div className="formMeta">
            <span>Осталось символов: {charactersLeft}</span>
            <span>Лимит в базе: до 1000 открыток в месяц</span>
          </div>

          <div className="actionRow">
            <button className="primaryButton" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Сохраняем..." : "Создать ссылку"}
            </button>
            <button
              className="secondaryButton"
              type="button"
              onClick={() => {
                setText(DEFAULT_CARD_TEXT);
                setShareUrl("");
                setErrorMessage("");
                setCopied(false);
              }}
            >
              Сбросить текст
            </button>
          </div>
        </form>

        {errorMessage ? <p className="messageBox messageBox--error">{errorMessage}</p> : null}

        {shareUrl ? (
          <div className="messageBox">
            <p className="messageTitle">Открытка создана</p>
            <a className="shareLink" href={shareUrl}>
              {shareUrl}
            </a>

            <div className="actionRow">
              <button className="primaryButton" type="button" onClick={handleCopyLink}>
                {copied ? "Ссылка скопирована" : "Скопировать ссылку"}
              </button>
              <a className="secondaryButton secondaryButton--link" href={shareUrl}>
                Открыть открытку
              </a>
            </div>
          </div>
        ) : null}

        <div className="helperCard">
          <p className="messageTitle">Как это работает</p>
          <ol className="stepsList">
            <li>Пишете текст поздравления.</li>
            <li>Нажимаете «Создать ссылку».</li>
            <li>Текст сохраняется в Postgres, а ссылка ведет на отдельную страницу открытки.</li>
          </ol>
          <p className="pageDescription">
            Формат ссылки будет таким: <code>/cards/&lt;id&gt;</code>.
          </p>
        </div>
      </section>

      <section className="contentPanel contentPanel--preview">
        <div className="previewHeader">
          <div>
            <p className="eyebrow">Предпросмотр</p>
            <h2 className="panelTitle">Так выглядит открытка</h2>
          </div>
          <p className="previewHint">Нажмите на карточку, чтобы открыть или закрыть ее.</p>
        </div>

        <CardScene text={previewText} initiallyOpen />
      </section>
    </main>
  );
}
