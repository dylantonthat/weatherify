import Link from "next/link";
import styles from "/styles/Home.module.css";

export default function about() {
  return (
    <div className={styles.container}>
      <main>
        <h1 className={styles.title}>
          <Link href="/">Weatherify</Link>
        </h1>
      </main>
    </div>
  );
}
