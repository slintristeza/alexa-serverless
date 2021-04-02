import * as fs from 'fs';
import * as iconv from 'iconv-lite';
import * as csv from 'csvtojson';

const parse = (path: string): Promise<any[]> => {
  return new Promise((resolve, _reject) => {
    let datas: any[] = [];
    fs.createReadStream(path)
      .pipe(iconv.decodeStream('Shift_JIS'))
      .pipe(iconv.encodeStream('utf-8'))
      .pipe(csv().on('data', (data) => datas.push(JSON.parse(data))))
      .on('end', () => resolve(datas));
  });
};

if (!module.parent) {
  parse('./2-3大型ごみ収集日（南区）.csv').then((results: any[]) => {
    console.table(results);
    fs.writeFileSync('./largeGarbageCollectionSchedule.json', JSON.stringify(results, null, '    '));
  });
}
