<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Distributors\Distributor;

class DistributorSeeder extends Seeder
{
    public function run(): void
    {
        $distributors = [

            // AREQUIPA
            [
                'name' => 'P & S PROFESSIONAL E.I.R.L.',
                'region' => 'Arequipa',
                'ruc' => '20612994511',
                'address' => 'URB LAS BEGONIAS MZ G LOTE 6 JOSE LUIS BUSTAMANTE Y RIVERO',
                'email' => 'peterflores@pysprofessional.com',
                'phone' => '932600621',
                'note' => null,
                'establishment_img' => null,
                'lat' => -16.4262704,
                'lng' => -71.5271567,
            ],
            [
                'name' => 'MUMAZ DISTRIBUCIONES S.A.C.',
                'region' => 'Arequipa',
                'ruc' => '20609814102',
                'address' => 'MZA I LOTE 9 URB LOS ZAFIROS - PAUCARPATA',
                'email' => 'lucho.munoz.ma@gmail.com',
                'phone' => '959637693',
                'note' => null,
                'lat' => -16.4309568,
                'lng' => -71.5099499,
            ],
            [
                'name' => 'COMERCIAL LA GOLOSINA S.A.C.',
                'region' => 'Arequipa',
                'ruc' => '20129973880',
                'address' => 'CAL SAN PEDRO 275',
                'email' => 'valeria.fernandez@lagolosina.com.pe',
                'phone' => '994287414',
                'note' => null,
                'lat' => -16.3957574,
                'lng' => -71.5283004,
            ],

            // TUMBES
            [
                'name' => 'DISTRIBUCIONES ABRAHAM INVERSIONES Y NEGOCIOS E.I.R.L.',
                'region' => 'Tumbes',
                'ruc' => '20610631704',
                'address' => 'AV 28 DE JULIO LOS PINOS – ZORRITOS',
                'email' => 'ramirezlopezguianella@gmail.com',
                'phone' => '967103974',
                'note' => null,
                'lat' => -3.680421,
                'lng' => -80.6838053,
            ],
            [
                'name' => 'SOLUCIONES INTEGRALES EL SIAR E.I.R.L.',
                'region' => 'Tumbes',
                'ruc' => '20525558682',
                'address' => 'AV PANAMERICANA NORTE 132 CANOAS DE PUNTA SAL',
                'email' => 'siarbodega@gmail.com',
                'phone' => '936417610',
                'note' => null,
                'lat' => -3.9530984,
                'lng' => -80.9484595,
            ],

            // TRUJILLO
            [
                'name' => 'LUVAL EMPRESAS E.I.R.L.',
                'region' => 'La Libertad',
                'ruc' => '20612899895',
                'address' => 'MZA X LOTE 5 URB COVICORTI',
                'email' => 'medical59@outlook.com',
                'phone' => '942270618',
                'note' => null,
                'lat' => -8.1121092,
                'lng' => -79.0478477,
            ],
            [
                'name' => 'EUROQUIMICOS PERU S.A.C.',
                'region' => 'La Libertad',
                'ruc' => '20600316754',
                'address' => 'Av. España 1246',
                'email' => 'industriaselprincipe@hotmail.com',
                'phone' => '956527651',
                'note' => null,
                'lat' => -8.110103,
                'lng' => -79.0171134,
            ],

            // PIURA
            [
                'name' => 'VENTAS Y SERVICIOS ADRIANA NICOL S.R.L.',
                'region' => 'Piura',
                'ruc' => '20529727101',
                'address' => 'MZA J LOTE 05 A.H JOSE OLAYA',
                'email' => 'ventasyserviciosnicolsrl@hotmail.com',
                'phone' => '905473343',
                'note' => null,
                'lat' => -5.2037811,
                'lng' => -80.6367315,
            ],

            // ICA
            [
                'name' => 'SOFER DIAGNOSTICS E.I.R.L.',
                'region' => 'Ica',
                'ruc' => '20534929081',
                'address' => 'Mza M Lote 08 C.P. El Tigre',
                'email' => 'sofer.diagnostics@gmail.com',
                'phone' => '950136987',
                'note' => null,
                'lat' => -13.4246762,
                'lng' => -76.1168082,
            ],
            [
                'name' => 'HUERTAS CHAPILLIQUEN AMBAR MILUSKA',
                'region' => 'Ica',
                'ruc' => '10425330379',
                'address' => 'URB CIUDADELA MAGISTERIAL H-15',
                'email' => 'atencion@californiamail.com',
                'phone' => '959592056',
                'note' => null,
                'lat' => -14.0794443,
                'lng' => -75.7411465,
            ],

            // HUANCAYO
            [
                'name' => 'INVERSIONES SAN JORGE S.R.L.',
                'region' => 'Junín',
                'ruc' => '20486697947',
                'address' => 'JR HUÁNUCO 445',
                'email' => 'inversiones.sanjorge22@gmail.com',
                'phone' => '978145000',
                'note' => null,
                'lat' => -12.0735644,
                'lng' => -75.2076509,
            ],

            // CUSCO
            [
                'name' => 'PAPA DE AMERICA S.A.',
                'region' => 'Cusco',
                'ruc' => null,
                'address' => null,
                'email' => 'orion.areacomercial@gmail.com',
                'phone' => '931061296',
                'note' => null,
                'lat' => -13.5317304,
                'lng' => -71.9556703,
            ],
            [
                'name' => 'DISTRIBUCIONES LIP E.I.R.L.',
                'region' => 'Cusco',
                'ruc' => '20606178434',
                'address' => 'MZA V LOTE 2 URB SANTA ROSA',
                'email' => 'distribucioneslip7@gmail.com',
                'phone' => '986815639',
                'note' => null,
                'lat' => -13.5399482,
                'lng' => -71.9084726,
            ],
            [
                'name' => 'BYOCLEAN INVERSIONES E.I.R.L.',
                'region' => 'Cusco',
                'ruc' => '20603133995',
                'address' => 'Av Tullumayo 545',
                'email' => 'byocleanlimpieza@hotmail.com',
                'phone' => '984957125',
                'note' => null,
                'lat' => -13.519955,
                'lng' => -71.973839,
            ],
            [
                'name' => 'PLASTIQUERIA PAZ SUR S.A.C.',
                'region' => 'Cusco',
                'ruc' => '20527551154',
                'address' => 'Cl Tres Cruces de Oro 284A',
                'email' => 'pazsursac@hotmail.com',
                'phone' => '958507175',
                'note' => null,
                'lat' => -13.522916,
                'lng' => -71.9812033,
            ],
            [
                'name' => 'HUILLCA SALAS LUCY',
                'region' => 'Cusco',
                'ruc' => '10076239741',
                'address' => 'URB NACIONES UNIDAS LL-1',
                'email' => 'Lucy9001@hotmail.es',
                'phone' => '946587084',
                'note' => null,
                'lat' => -13.5299869,
                'lng' => -72.0032603,
            ],

            // IQUITOS
            [
                'name' => 'DISTRIBUIDORA JOBARO E.I.R.L.',
                'region' => 'Loreto',
                'ruc' => '20611453290',
                'address' => 'MZA H LOTE 1 URB VIRGEN DE LORETO',
                'email' => 'jbarciar@hotmail.com',
                'phone' => '941983415',
                'note' => null,
                'lat' => -3.7390758,
                'lng' => -73.2534119,
            ],
            [
                'name' => 'SERVICIOS GENERALES L & L E.I.R.L.',
                'region' => 'Loreto',
                'ruc' => '20600180976',
                'address' => 'Calle Yavari 467',
                'email' => 'larsvela@gmail.com',
                'phone' => '948664568',
                'note' => null,
                'lat' => -3.744779,
                'lng' => -73.2438411,
            ],

            // CAJAMARCA
            [
                'name' => 'DERO SERV.GENERALES S.R.L.',
                'region' => 'Cajamarca',
                'ruc' => '20560082411',
                'address' => 'JR AYACUCHO 1235 BARRIO LA COLMENA',
                'email' => 'serviciosgeneralesdero@gmail.com',
                'phone' => '944534911',
                'note' => null,
                'lat' => -7.1557509,
                'lng' => -78.5120606,
            ],

        ];

        foreach ($distributors as $distributor) {
            Distributor::create($distributor);
        }
    }
}