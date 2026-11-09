import Image from "next/image";
import { redirect } from "next/navigation";

import styles from "./temp.module.css";

export default function Home() {
  redirect("/chat");
  console.log(styles);
  return (
    <main className={styles.container}>
      <div className={styles.container}></div>
    </main>
  );
}
