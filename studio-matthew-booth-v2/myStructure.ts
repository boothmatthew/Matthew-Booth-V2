import {CogIcon, DocumentsIcon, TagIcon, DocumentIcon, UsersIcon, FolderIcon} from '@sanity/icons'
import {orderableDocumentListDeskItem} from '@sanity/orderable-document-list'

export const myStructure = (S: any, context: any) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Site Settings')
        .icon(CogIcon)
        .child(S.document().schemaType('siteSettings').documentId('siteSettings')),
      orderableDocumentListDeskItem({S, context, type: 'entry', title: 'Entries', icon: DocumentsIcon}),
      S.documentTypeListItem('page').title('Pages').icon(DocumentIcon),
      orderableDocumentListDeskItem({S, context, type: 'category', title: 'Categories', icon: TagIcon}),
      S.documentTypeListItem('collection').title('Collections').icon(FolderIcon),
      S.documentTypeListItem('siteUser').title('Site Users').icon(UsersIcon),
    ])
