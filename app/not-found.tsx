import Link from "next/link";

export default function NotFound() {
  return (
    <main className="pageShell">
      <section className="contentPanel contentPanel--form">
        <p className="eyebrow">404</p>
        <h1 className="pageTitle">Открытка не найдена</h1>
        <p className="pageDescription">
          Проверьте ссылку или создайте новую открытку на главной странице.
        </p>
        <Link className="primaryButton primaryButton--link" href="/">
          Перейти к созданию открытки
        </Link>
      </section>
    </main>
  );
}
