module.exports = {
    name: 'vant-icon',
    icons: [
        <% _.join(_.map(glyphs, function(glyph) { return glyph.glyphName }), ",") %>
    ]
}