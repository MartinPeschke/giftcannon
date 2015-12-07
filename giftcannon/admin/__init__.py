
def includeme(config):
  config.add_route('admin_index', '/admin')
  config.add_route('admin_merchant_details', '/admin/:id/details')
  config.add_route('admin_bank_details', '/admin/:id/bank')
  config.add_route('admin_merchant_create', '/admin/create')
  config.add_route('admin_entity_create', '/admin/:entity/create')
  config.add_route('admin_entity_update', '/admin/update')
  config.add_route('admin_highlight_product', '/admin/product/highlight')
  
  
  config.add_static_view('admin/static', 'giftcannon:admin/static', cache_max_age=3600)