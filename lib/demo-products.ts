export type DemoProduct = { code: string; number: number; name: string; details: string; colour: string; accent: string };
const colours = [
  ['#376a9b', '#b9d9ee'], ['#8b4c79', '#f1cae6'], ['#af652d', '#f3d6ab'],
  ['#3d8069', '#c5ebdd'], ['#6d5aa6', '#e1d6f6'], ['#986054', '#f4d9d1'],
  ['#497e9c', '#cce7ef'], ['#777d38', '#e7e9bf'], ['#b45b69', '#f5d6dc'],
  ['#496cbb', '#d9e4ff']
] as const;
export const demoProducts: DemoProduct[] = colours.map(([colour, accent], index) => {
  const number = index + 1;
  return {
    code: 'DEMO-' + String(number).padStart(3, '0'),
    number,
    name: 'Product ' + number,
    details: 'Sample product page for testing batch verification. Replace this text with your own product information.',
    colour,
    accent
  };
});
export function getDemoProduct(code: string): DemoProduct | undefined {
  return demoProducts.find(product => product.code === code);
}
