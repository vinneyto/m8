import Link from "next/link";
import { notFound } from "next/navigation";
import { CardScene } from "@/components/card-scene";
import { getCardById, isDatabaseConfigured } from "@/lib/cards";

export const dynamic = "force-dynamic";

interface CardPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CardPage({ params }: CardPageProps) {
  const { id } = await params;

  if (!isDatabaseConfigured()) {
    return (
      <main className="pageShell">
        <section className="contentPanel contentPanel--form">
          <p className="eyebrow">Нужна настройка базы</p>
          <h1 className="pageTitle">Открытка пока недоступна</h1>
          <p className="pageDescription">
            Для просмотра сохраненных открыток подключите Neon/Postgres и задайте
            переменную <code>DATABASE_URL</code>.
          </p>
          <Link className="primaryButton primaryButton--link" href="/">
            Вернуться к форме создания
          </Link>
        </section>
      </main>
    );
  }

  const card = await getCardById(id);

  if (!card) {
    notFound();
  }

  const createdAt = new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(card.createdAt));

  return (
    <main className="pageShell">
      <section className="contentPanel contentPanel--form">
        <p className="eyebrow">Открытка по ссылке</p>
        <h1 className="pageTitle">Поздравление к 8 Марта</h1>
        <p className="pageDescription">
          Эта страница открывается по индивидуальной ссылке. Текст хранится в
          Postgres и подгружается по id открытки.
        </p>

        <div className="helperCard">
          <p className="messageTitle">Текст поздравления</p>
          <p className="cardTextBlock">{card.text}</p>
        </div>

        <div className="helperCard">
          <p className="messageTitle">Детали</p>
          <dl className="detailsList">
            <div>
              <dt>ID</dt>
              <dd>{card.id}</dd>
            </div>
            <div>
              <dt>Создана</dt>
              <dd>{createdAt}</dd>
            </div>
          </dl>
        </div>

        <div className="actionRow">
          <Link className="primaryButton primaryButton--link" href="/">
            Создать свою открытку
          </Link>
        </div>
      </section>

      <section className="contentPanel contentPanel--preview">
        <div className="previewHeader">
          <div>
            <p className="eyebrow">Просмотр</p>
            <h2 className="panelTitle">Интерактивная открытка</h2>
          </div>
          <p className="previewHint">Карточку можно вращать и приближать.</p>
        </div>

        <CardScene text={card.text} initiallyOpen />
      </section>
    </main>
  );
}
