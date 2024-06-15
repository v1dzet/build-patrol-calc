export function generatePDF(title1, title2, input, output, footer, filename, title1_interval, input_interval, title2_interval, output_interval){
    const jsPDF = window.jspdf.jsPDF;
    var doc = new jsPDF({orientation: "p", lineHeight: 1.5});

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(24);
    doc.text(title1, doc.internal.pageSize.width / 2, title1_interval, 'center')

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(16);
    doc.text(input, 25, input_interval, 'left');

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(24);
    doc.text(title2, doc.internal.pageSize.width / 2, title2_interval, 'center')

    doc.setFont('Roboto', 'normal');
    doc.setFontSize(16);
    doc.text(output, 25, output_interval, 'left');

    doc.setFontSize(12);
    doc.text(footer, doc.internal.pageSize.width / 2, doc.internal.pageSize.height-3, 'center');

    let now = new Date();
    filename =  now.getDate() + '.' +  (now.getMonth()+1) + '.' +  now.getFullYear() + '_' + filename;

    doc.save(filename);
}