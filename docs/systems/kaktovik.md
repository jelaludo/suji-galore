# Kaktovik numerals · イヌピアック数字

Kaktovik numerals are positional base 20 with a visible sub-base of five. In each digit, up to three strokes count groups of five and up to four strokes count ones. For example, 12 is two five-strokes plus two one-strokes; 20 is written as the base-20 pair `[1][0]`.

The playground draws an original, simplified straight-stroke interpretation on a fixed ladder. The bottom five-stroke is 5; adding one stroke above it makes 10, and adding a third above makes 15. The unit zigzag occupies a fixed lower region and begins at the five-group’s lower-left attachment point. Thus 6, 11, and 16 preserve their five-groups and add the same `o1` stroke. Stable geometry for parts `f1`–`f3` and `o1`–`o4` makes addition and subtraction visible during counting and allows exact composition exercises. The zero is a separate hooked loop.

Reference:

https://www.unicode.org/charts/PDF/U1D2C0.pdf

https://www.unicode.org/versions/Unicode17.0.0/core-spec/chapter-22/

https://www.unicode.org/L2/L2021/21058r-kaktovik-numerals.pdf

The Unicode chart states that its reference glyph shapes are not prescriptive. The core specification defines the joined five/unit structure, and the encoding proposal documents community usage and writing examples. The local reference sheet and joins between components remain listed in `docs/verify.md` for human review.
