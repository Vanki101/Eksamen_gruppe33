export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'gender',
      title: 'Gender',
      type: 'string',
      options: {
        list: ['Male', 'Female', 'Other'],
        layout: 'radio',
      },
    },
    {
      name: 'age',
      title: 'Age',
      type: 'number',
    },
    {
      name: 'previousPurchases',
      title: 'Previous Purchases',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'wishlist',
      title: 'Wishlist',
      type: 'array',
      of: [{type: 'string'}],
    },
    {
      name: 'friends',
      title: 'Friends',
      type: 'array',
      of: [{type: 'reference', to: [{type: 'user'}]}],
      description: 'List of user friends (references to other user documents)',
    },
  ],
}
