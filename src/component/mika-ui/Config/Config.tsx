import React, {memo, useEffect} from "react";

export type ThemeConfig = {
    // 主题色
    primaryColor?: string;
    // 辅助色1
    secondaryColor?: string;
    // 辅助色2
    tertiaryColor?: string;
    // 字体颜色
    fontColor?: string;
    // 背景色
    backgroundColor?: string;
    // 强调色
    emphasisColor?: string;
    // 错误色
    errorColor?: string;
    // 成功色
    successColor?: string;
    // 警告色
    primaryButtonFontColor?: string;
    disabledColor?: string;

    smallFontSize?: string;
    mediumFontSize?: string;
    largeFontSize?: string;
    smallPadding?: string;
    mediumPadding?: string;
    largePadding?: string;
    smallMargin?: string;
    mediumMargin?: string;
    largeMargin?: string;
    borderRadius?: string;
    boxShadow?: string;
}
const defaultTheme: ThemeConfig = {
    // 主题色
    primaryColor: '#ceb7d5',
    // 辅助色1
    secondaryColor: '#a692b1',
    // 辅助色2
    tertiaryColor: '#e1d5e6',
    // 字体颜色
    fontColor: '#333333',
    // 背景色
    backgroundColor: '#ffffff',
    // 强调色
    emphasisColor: '#8c5b8f',
    // 错误色
    errorColor: '#ff0000',
    // 成功色
    successColor: '#00ff00',
    // Primary Button 字体颜色
    primaryButtonFontColor: '#ffffff',
    // 禁用色
    disabledColor: '#f4f4f4',

    // 字体大小
    smallFontSize: '12px',
    mediumFontSize: '16px',
    largeFontSize: '20px',

    // 内边距
    smallPadding: '8px',
    mediumPadding: '12px',
    largePadding: '16px',

    // 外边距
    smallMargin: '8px',
    mediumMargin: '12px',
    largeMargin: '16px',

    // 边框圆角
    borderRadius: '4px',

    // 阴影
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
};

export type ConfigProps = {
    theme?: ThemeConfig;
    children?: React.ReactNode;
};
const defaultConfig: ConfigProps = {
    theme: defaultTheme,
};

export const ConfigContext = React.createContext(defaultConfig);

const Config = memo((props: ConfigProps) => {
    useEffect(() => {
        if (props.theme && props.theme !== defaultTheme) {
            const style = document.createElement('style');
            const cssVariables = Object.entries(defaultTheme)
                .map(([key, value]) => `--mika-${key.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`)}: ${value};`)
                .join('');
            style.innerHTML = `
            :root {
                ${cssVariables}
            }`;
            document.head.appendChild(style);
        }
    });

    return (
        <ConfigContext.Provider value={props}>
            {props.children}
        </ConfigContext.Provider>
    );
});

export default Config;
