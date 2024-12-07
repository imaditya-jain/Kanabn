import localFont from 'next/font/local';

const InterFont = localFont({
  src: [
    {
      path: '../../fonts/Inter-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../fonts/Inter-SemiBold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../fonts/Inter-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../fonts/Inter-Light.woff',
      weight: '300',
      style: 'normal',
    },
  ], 
  variable: '--font-inter',
});

export default InterFont;
