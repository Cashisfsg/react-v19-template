import styles from "./Carousel.module.css";

export const Carousel = () => {
    return (
        <div className={styles["scroll-layout"]}>
            <div className={styles.carousel}>
                <ul className={styles.content}>
                    <li>1</li>
                    <li>2</li>
                    <li>3</li>
                    <li>4</li>
                    <li>5</li>
                    <li>6</li>
                    <li>7</li>
                    <li>8</li>
                    <li>9</li>
                    <li>10</li>
                </ul>
            </div>
        </div>
    );
};
