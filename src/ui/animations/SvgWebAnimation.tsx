import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface SvgWebAnimationProps {
  svgContent: string;
  size?: number;
  backgroundColor?: string;
}

export const SvgWebAnimation: React.FC<SvgWebAnimationProps> = ({
  svgContent,
  size = 220,
  backgroundColor = 'transparent',
}) => {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
            background-color: ${backgroundColor};
            display: flex;
            align-items: center;
            justify-content: center;
            -webkit-user-select: none;
            user-select: none;
          }
          svg {
            width: 100%;
            height: 100%;
            max-width: ${size}px;
            max-height: ${size}px;
          }
        </style>
      </head>
      <body>
        ${svgContent}
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        style={{
          width: size,
          height: size,
          backgroundColor: 'transparent',
        }}
        containerStyle={{
          backgroundColor: 'transparent',
        }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        scalesPageToFit={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        transparent={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
});
