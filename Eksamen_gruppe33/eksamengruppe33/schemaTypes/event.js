export default {
  name: 'event',
  title: 'Event',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'apiId',
      title: 'API ID',
      type: 'string',
      description: 'ID of the event, retrieved from the Ticketmaster API',
    },
  ],
}
