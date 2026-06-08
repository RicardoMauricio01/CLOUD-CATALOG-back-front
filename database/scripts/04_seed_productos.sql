INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url, categoria_id) VALUES
('Fideo Espiral', NULL, 890, 50, 'https://i.ibb.co/F4PgLxtY/5a16e5ab-0772-441a-b563-fbefaf1f30f5-3fb9e4ac940c073de710f5ce6622b6cd.jpg', 5),
('Arroz Grano Largo', NULL, 1290, 80, 'https://i.ibb.co/Rp7Gjxp7/images-q-tbn-ANd9-Gc-Sid-W09qi-K8u-NICZak-Vlq-ZTNOf-CQb-Iic-Rq-sg-s.jpg', 5),
('Aceite de Girasol', NULL, 2490, 40, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSFpntz5fcKHDvwKFWlADCTKV2V3_ZbQ1AQQ&s', 5),
('Harina de Trigo', NULL, 990, 60, 'https://alvicl.vtexassets.com/arquivos/ids/156497/Harina-sin-polvos.jpg?v=637867750289630000', 5),
('Salsa de Tomate', NULL, 790, 45, 'https://http2.mlstatic.com/D_Q_NP_2X_727503-MLC108577188180_032026-T.webp', 5),
('Leche Entera', NULL, 1090, 100, 'https://santaisabel.vtexassets.com/arquivos/ids/543185/Leche-Soprole-Entera-Natural-1-L.jpg?v=638967404264730000', 6),
('Queso Gauda', NULL, 3490, 30, 'https://alvicl.vtexassets.com/arquivos/ids/161141/000000000000634460-UN-01.jpg?v=638243576493500000', 6),
('Bandeja de Huevos x12', NULL, 2990, 35, 'https://supermag.cl/cdn/shop/files/image_64e0c5ea-23c2-45a9-acc9-121da40f3b50.jpg?v=1686837210', 6),
('Detergente Lquido', NULL, 1890, 25, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStDlmcHIEwYBPqFfW3Yyt0UHSe5O2WT8qowg&s', 7),
('Lavaloza Concentrado', NULL, 1290, 30, 'https://www.prisa.cl/media/cache/attachment/filter/product_gallery_main/b6b1adc76b36bd6a7f81344215e93277/272924/67bf310ba1b83407705746.png', 7),
('Pan de Molde Blanco', NULL, 1590, 40, 'https://www.bodegamarket.cl/cdn/shop/files/000000000000664046-UN-01_jpg.webp?v=1720665965', 8);

SELECT id, nombre, precio, imagen_url, categoria_id FROM productos ORDER BY id;
