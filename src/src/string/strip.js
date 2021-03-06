//^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
// Removes all non ASCII characters
//------------------------------------------------------------------------------
module.exports = value => {
  // great unicode list: http://asecuritysite.com/coding/asc2
  const diacritics = [
    [/[\300-\305]/g, 'A'],
    [/[\340-\345]/g, 'a'],
    [/[\306]/g, 'AE'],
    [/[\346]/g, 'ae'],
    [/[\337]/g, 'B'],
    [/[\307]/g, 'C'],
    [/[\347]/g, 'c'],
    [/[\320\336\376]/g, 'D'],
    [/[\360]/g, 'd'],
    [/[\310-\313]/g, 'E'],
    [/[\350-\353]/g, 'e'],
    [/[\314-\317]/g, 'I'],
    [/[\354-\357]/g, 'i'],
    [/[\321]/g, 'N'],
    [/[\361]/g, 'n'],
    [/[\322-\326\330]/g, 'O'],
    [/[\362-\366\370]/g, 'o'],
    [/[\331-\334]/g, 'U'],
    [/[\371-\374]/g, 'u'],
    [/[\327]/g, 'x'],
    [/[\335]/g, 'Y'],
    [/[\375\377]/g, 'y']
  ];

  return (
    '' +
    value.toString().replace(/[^A-Za-z0-9\-_]/g, char => {
      if (char === ' ') {
        return '-';
      }

      let ret = false;
      for (let d = 0; d < diacritics.length; d++) {
        if (new RegExp(diacritics[d][0]).test(char)) {
          ret = diacritics[d][1];
          break;
        }
      }

      return ret || '';
    })
  );
};
