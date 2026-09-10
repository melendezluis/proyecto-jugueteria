<?php

/*
 * Exporta los datos actuales de la BD productiva a database/seeders/real_data.php
 * para reproducirlos en otros entornos (companero, CI, staging).
 *
 * Uso: php database/seeders/support/export_real_data.php
 *
 * El archivo generado se consume en RealDataSeeder. Las tablas transitorias
 * (carts, cart_items, sessions, personal_access_tokens, media) no se exportan.
 */

require __DIR__ . '/../../../vendor/autoload.php';

use Illuminate\Support\Facades\DB;

$app = require __DIR__ . '/../../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$out = [];

// ---------- Categorias ----------
$out['categories'] = [];
foreach (DB::table('categories')->orderBy('id')->get() as $row) {
    $r = (array) $row;
    unset($r['id']);
    $out['categories'][] = $r;
}

// ---------- Marcas ----------
$out['brands'] = [];
foreach (DB::table('brands')->orderBy('id')->get() as $row) {
    $r = (array) $row;
    unset($r['id']);
    $out['brands'][] = $r;
}

// ---------- Roles por usuario (email => [roles]) ----------
$userRoles = [];
foreach (DB::table('users')->get() as $user) {
    $rows = DB::table('model_has_roles')
        ->join('roles', 'roles.id', '=', 'model_has_roles.role_id')
        ->where('model_has_roles.model_id', $user->id)
        ->where('model_has_roles.model_type', App\Models\User::class)
        ->pluck('roles.name')
        ->all();
    $userRoles[$user->email] = array_values($rows);
}

// ---------- Usuarios ----------
$out['users'] = [];
foreach (DB::table('users')->orderBy('id')->get() as $row) {
    $r = (array) $row;
    unset($r['id']);
    $r['roles'] = $userRoles[$r['email']] ?? [];
    $out['users'][] = $r;
}

// ---------- Productos (con variantes e imagenes anidadas) ----------
$out['products'] = [];
foreach (DB::table('products')->orderBy('id')->get() as $row) {
    $r = (array) $row;
    $pId = $r['id'];
    unset($r['id']);

    $cat = DB::table('categories')->where('id', $r['category_id'])->value('slug');
    $brand = DB::table('brands')->where('id', $r['brand_id'])->value('slug');
    unset($r['category_id'], $r['brand_id']);
    $r['category_slug'] = $cat;
    $r['brand_slug'] = $brand;

    $r['images'] = [];
    foreach (DB::table('product_images')->where('product_id', $pId)->orderBy('position')->get() as $img) {
        $i = (array) $img;
        unset($i['id'], $i['product_id']);
        $r['images'][] = $i;
    }

    $r['variants'] = [];
    foreach (DB::table('product_variants')->where('product_id', $pId)->orderBy('id')->get() as $var) {
        $v = (array) $var;
        unset($v['id'], $v['product_id']);
        $r['variants'][] = $v;
    }

    $out['products'][] = $r;
}

// ---------- Pedidos (con lineas anidadas) ----------
$out['orders'] = [];
foreach (DB::table('orders')->orderBy('id')->get() as $row) {
    $r = (array) $row;
    $oId = $r['id'];
    unset($r['id']);

    $userEmail = DB::table('users')->where('id', $r['user_id'])->value('email');
    unset($r['user_id']);
    $r['user_email'] = $userEmail;

    $r['items'] = [];
    foreach (DB::table('order_items')->where('order_id', $oId)->orderBy('id')->get() as $item) {
        $it = (array) $item;
        $itId = $it['id'];
        unset($it['id'], $it['order_id']);

        if ($it['product_id'] !== null) {
            $slug = DB::table('products')->where('id', $it['product_id'])->value('slug');
            $it['product_slug'] = $slug;
        } else {
            $it['product_slug'] = null;
        }
        unset($it['product_id']);

        $r['items'][] = $it;
    }

    $out['orders'][] = $r;
}

// ---------- Escribir archivo ----------
$php = "<?php\n\nreturn " . export($out) . ";\n";
$path = __DIR__ . '/../real_data.php';
file_put_contents($path, $php);

echo "OK: " . realpath($path) . "\n";

// ---------- Resumen de imagenes referenciadas ----------
echo "\nImagenes referenciadas:\n";
$referenced = [];
foreach ($out['products'] as $p) {
    foreach ($p['images'] as $img) {
        $base = basename($img['image_path']);
        $referenced[$base] = $img['image_path'];
    }
}
foreach ($referenced as $base => $pathRef) {
    $exists = file_exists(__DIR__ . '/../../../storage/app/public/products/' . $base);
    printf("  %-55s %s\n", $base, $exists ? 'EXISTE' : 'FALTA EN STORAGE');
}

// ---------- Resumen de archivos en storage no referenciados ----------
echo "\nArchivos en storage/app/public/products:\n";
$dir = __DIR__ . '/../../../storage/app/public/products';
foreach (glob($dir . '/*') as $f) {
    $base = basename($f);
    printf("  %-55s %s\n", $base, isset($referenced[$base]) ? '(referenciado)' : '(sin referencia)');
}

function export($value, $indent = 0)
{
    $pad = str_repeat('    ', $indent);
    if (is_array($value)) {
        if (array_is_list($value)) {
            if ($value === []) {
                return '[]';
            }
            $res = "[\n";
            foreach ($value as $v) {
                $res .= $pad . '    ' . export($v, $indent + 1) . ",\n";
            }
            return $res . $pad . ']';
        }
        $res = "[\n";
        foreach ($value as $k => $v) {
            $key = var_export((string) $k, true);
            $res .= $pad . '    ' . $key . ' => ' . export($v, $indent + 1) . ",\n";
        }
        return $res . $pad . ']';
    }
    return var_export($value, true);
}