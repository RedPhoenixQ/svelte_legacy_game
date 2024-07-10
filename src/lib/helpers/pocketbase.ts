import type {
	GenericCollection,
	ResolveSelectWithExpand,
	SelectWithExpand
} from 'typed-pocketbase';

export type SelectExpanded<
	TCollection extends GenericCollection,
	SelectExpanded extends SelectWithExpand<TCollection> = object
> = ResolveSelectWithExpand<TCollection, SelectExpanded>;
