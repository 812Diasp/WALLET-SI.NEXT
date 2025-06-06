import React from "react";
import { gsap } from "gsap";

import "./FlowingMenu.css";

interface MenuItemProps {
    link: string;
    text: string;
    image: string;
}

interface FlowingMenuProps {
    items?: MenuItemProps[];
    theme?: "dark" | "light"; // Принимаем тему как пропс
}
const FlowingMenu: React.FC<FlowingMenuProps> = ({ items = [], theme = "dark" }) => {
    return (
        <div className="menu-wrap">
            <nav className={`menu ${theme === 'dark' ? 'menu-dark' : 'menu-light'}`}>
                {items.map((item, idx) => (
                    <MenuItem key={idx} {...item} theme={theme} />
                ))}
            </nav>
        </div>
    );
};
interface MenuItemProps {
    link: string;
    text: string;
    image: string;
    theme?: "dark" | "light";
}

const MenuItem: React.FC<MenuItemProps> = ({ link, text, image, theme = "dark" }) => {
    const itemRef = React.useRef<HTMLDivElement>(null);
    const marqueeRef = React.useRef<HTMLDivElement>(null);
    const marqueeInnerRef = React.useRef<HTMLDivElement>(null);

    const animationDefaults: gsap.TweenVars = { duration: 0.6, ease: "expo" };

    const distMetric = (x: number, y: number, x2: number, y2: number): number => {
        const xDiff = x - x2;
        const yDiff = y - y2;
        return xDiff * xDiff + yDiff * yDiff;
    };

    const findClosestEdge = (
        mouseX: number,
        mouseY: number,
        width: number,
        height: number
    ): "top" | "bottom" => {
        const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
        const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
        return topEdgeDist < bottomEdgeDist ? "top" : "bottom";
    };

    const handleMouseEnter = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
            return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);

        const tl = gsap.timeline({ defaults: animationDefaults });

        tl.set(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0)
            .set(marqueeInnerRef.current, { y: edge === "top" ? "101%" : "-101%" }, 0)
            .to([marqueeRef.current, marqueeInnerRef.current], { y: "0%" }, 0);
    };

    const handleMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current)
            return;
        const rect = itemRef.current.getBoundingClientRect();
        const x = ev.clientX - rect.left;
        const y = ev.clientY - rect.top;
        const edge = findClosestEdge(x, y, rect.width, rect.height);

        const tl = gsap.timeline({ defaults: animationDefaults });

        tl.to(marqueeRef.current, { y: edge === "top" ? "-101%" : "101%" }, 0).to(
            marqueeInnerRef.current,
            { y: edge === "top" ? "101%" : "-101%" },
            0
        );
    };

    const repeatedMarqueeContent = React.useMemo(() => {
        return Array.from({ length: 4 }).map((_, idx) => (
            <React.Fragment key={idx}>
                <span>{text}</span>
                <div
                    className="marquee__img"
                    style={{ backgroundImage: `url(${image})` }}
                />
            </React.Fragment>
        ));
    }, [text, image]);

    return (
        <div className="menu__item p-6 mb-2" ref={itemRef}>
            <a
                className={`menu__item-link ${theme === 'dark' ? 'text-white' : 'text-black'}`}
                href={link}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <img src={'/icons/down-arrow.svg'} alt={'^'} className={'w-8 h-8 mr-3'} style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
                {text}
                <img src={'/icons/down-arrow.svg'} alt={'^'} className={'w-8 h-8 ml-3'} style={{ filter: theme === 'dark' ? 'invert(1)' : 'none' }} />
            </a>
            <div className="marquee" ref={marqueeRef}>
                <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
                    <div className="marquee__inner" aria-hidden="true">
                        {repeatedMarqueeContent}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FlowingMenu;
