export { };

declare global {
    interface Window {
        clarity: (command: string, key: string, value: string) => void;
    }
}
