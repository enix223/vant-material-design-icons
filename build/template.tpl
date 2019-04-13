@font-face {
  font-style: normal;
  font-weight: normal;
  font-family: '<%= fontName %>';
  src: url('https://cdn.bootcss.com/material-design-icons/<%= version %>/iconfont/MaterialIcons-Regular.woff2') format('woff2'),
       url('https://cdn.bootcss.com/material-design-icons/<%= version %>/iconfont/MaterialIcons-Regular.woff') format('woff'),
       url('https://cdn.bootcss.com/material-design-icons/<%= version %>/iconfont/MaterialIcons-Regular.ttf') format('truetype');
}

.<%= fontName %> {
  position: relative;
  display: inline-block;
  font: normal normal normal 14px/1 "<%= fontName %>";
  font-size: inherit;
  text-rendering: auto;
  -webkit-font-smoothing: antialiased;
  &::before {
    display: inline-block;
  }
}

<% _.each(glyphs, function(glyph) { %>.<%= fontName %>-<%= glyph.glyphName %>:before {
  content: "\<%= glyph.codePoint %>";
}

<% }); %>