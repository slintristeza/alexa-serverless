import fs from 'fs';
import iconv from 'iconv-lite';
import csv from 'csvtojson';

const parse = (path: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    let datas: any[] = [];
    fs.createReadStream(path)
      .pipe(iconv.decodeStream('Shift_JIS'))
      .pipe(iconv.encodeStream('utf-8'))
      .pipe(csv().on('data', (data) => datas.push(JSON.parse(data))))
      .on('end', () => resolve(datas));
  });
};

if (!module.parent) {
  parse('./1-3家庭ごみ収集日（南区）.csv').then((results: any[]) => {
    console.table(results);
    fs.writeFileSync('./results.json', JSON.stringify(results, null, '    '));
  });
}
