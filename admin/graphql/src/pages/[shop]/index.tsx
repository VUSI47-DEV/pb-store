import ShopLayout from '@/components/layouts/shop';
import LinkButton from '@/components/ui/link-button';
import {
  ShopDocument,
  useMyShopsQuery,
  useShopQuery,
} from '@/graphql/shops.graphql';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { MapPin } from '@/components/icons/map-pin';
import { PhoneIcon } from '@/components/icons/phone';
import Loader from '@/components/ui/loader/loader';
import dayjs from 'dayjs';
import { CheckMarkFill } from '@/components/icons/checkmark-circle-fill';
import { CloseFillIcon } from '@/components/icons/close-fill';
import { EditIcon } from '@/components/icons/edit';
import { formatAddress } from '@/utils/format-address';
import {
  adminAndOwnerOnly,
  adminOnly,
  adminOwnerAndStaffOnly,
  getAuthCredentials,
  hasAccess,
} from '@/utils/auth-utils';
import ErrorMessage from '@/components/ui/error-message';
import usePrice from '@/utils/use-price';
import { useTranslation } from 'next-i18next';
import { addApolloState, initializeApollo } from '@/utils/apollo';
import isEmpty from 'lodash/isEmpty';
import { CubeIcon } from '@/components/icons/shops/cube';
import { OrdersIcon } from '@/components/icons/sidebar';
import { PriceWalletIcon } from '@/components/icons/shops/price-wallet';
import { PercentageIcon } from '@/components/icons/shops/percentage';
import { DollarIcon } from '@/components/icons/shops/dollar';
import ReadMore from '@/components/ui/truncate';
import { Routes } from '@/config/routes';

export default function ShopPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { permissions } = getAuthCredentials();
  const {
    query: { shop },
    locale,
  } = useRouter();
  const { data, loading, error } = useShopQuery({
    variables: {
      slug: shop!.toString(),
    },
  });
  const { data: myShop } = useMyShopsQuery();
  const { price: totalEarnings } = usePrice(
    data && {
      amount: data?.shop?.balance?.total_earnings!,
    }
  );
  const { price: currentBalance } = usePrice(
    data && {
      amount: data?.shop?.balance?.current_balance!,
    }
  );
  if (loading) return <Loader text={t('common:text-loading')} />;
  if (error) return <ErrorMessage message={error.message} />;
  const {
    name,
    is_active,
    logo,
    slug,
    cover_image,
    description,
    products_count,
    orders_count,
    balance,
    address,
    settings,
    created_at,
    id: shopId,
  } = data?.shop! ?? {};

  if (
    !hasAccess(adminOnly, permissions) &&
    !myShop?.me?.shops?.map((shop: any) => shop.id).includes(shopId) &&
    myShop?.me?.managed_shop?.id != shopId
  ) {
    router.replace(Routes.dashboard);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {!is_active && (
        <div className="col-span-12 px-5 py-4 text-sm bg-red-500 rounded-lg text-light">
          {t('common:text-permission-message')}
        </div>
      )}
      {/* about Shop */}
      <div className="order-2 col-span-12 xl:order-1 sm:col-span-6 xl:col-span-4 3xl:col-span-3">
        <div className="flex flex-col items-center px-6 py-8 bg-white rounded">
          <div className="relative mb-5 rounded-full w-36 h-36">
            <div className="relative flex items-center justify-center w-full h-full overflow-hidden border border-gray-100 rounded-full">
              <Image
                src={logo?.thumbnail ?? '/avatar-placeholder.svg'}
                fill
                sizes="(max-width: 768px) 100vw"
                className="object-contain"
                alt={name}
              />
            </div>

            {is_active ? (
              <div className="absolute w-5 h-5 overflow-hidden rounded-full bg-light bottom-4 end-2">
                <CheckMarkFill width={20} className="me-2 text-accent" />
              </div>
            ) : (
              <div className="absolute w-5 h-5 overflow-hidden rounded-full bg-light bottom-4 end-2">
                <CloseFillIcon width={20} className="text-red-500 me-2" />
              </div>
            )}
          </div>

          <h1 className="mb-2 text-xl font-semibold text-heading">{name}</h1>
          <p className="text-sm text-center text-body">
            <ReadMore character={70}>{description!}</ReadMore>
          </p>

          <div className="flex justify-start w-full mt-5">
            <span className="text-muted-light mt-0.5 me-2">
              <MapPin width={16} />
            </span>

            <address className="flex flex-col text-sm not-italic text-body">
              {!isEmpty(formatAddress(address!))
                ? formatAddress(address!)
                : t('common:text-no-address')}
            </address>
          </div>

          <div className="flex justify-start w-full mt-3">
            <span className="text-muted-light mt-0.5 me-2">
              <PhoneIcon width={16} />
            </span>
            <a href={`tel:${settings?.contact}`} className="text-sm text-body">
              {settings?.contact
                ? settings?.contact
                : t('common:text-no-contact')}
            </a>
          </div>

          <div className="grid w-full grid-cols-1 mt-7">
            <a
              href={`${process.env.NEXT_PUBLIC_SHOP_URL}/${locale}/shops/${slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 flex-shrink-0 items-center justify-center rounded !bg-gray-100 px-5 py-0 !font-normal leading-none !text-heading outline-none transition duration-300 ease-in-out hover:!bg-accent hover:!text-light focus:shadow focus:outline-none focus:ring-1 focus:ring-accent-700"
            >
              {t('common:text-visit-shop')}
            </a>
          </div>
        </div>
      </div>

      {/* Cover Photo */}
      <div className="relative order-1 col-span-12 h-full min-h-[400px] overflow-hidden rounded bg-light xl:order-2 xl:col-span-8 3xl:col-span-9">
        <Image
          src={cover_image?.original ?? '/product-placeholder-borderless.svg'}
          fill
          sizes="(max-width: 768px) 100vw"
          className="object-contain"
          alt={name}
        />

        {hasAccess(adminAndOwnerOnly, permissions) && (
          <LinkButton
            size="small"
            className="absolute bg-blue-500 shadow-sm top-3 ltr:right-3 rtl:left-3 hover:bg-blue-600"
            href={`/${shop}/edit`}
          >
            <EditIcon className="w-4 me-2" /> {t('common:text-edit-shop')}
          </LinkButton>
        )}
      </div>

      {/* Mini Dashboard */}
      <div className="order-4 col-span-12 xl:order-3 xl:col-span-9">
        <div className="grid h-full grid-cols-1 gap-5 p-4 rounded md:grid-cols-3 bg-light">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-heading">
              {t('common:text-products')}
            </h2>

            <div className="border border-gray-100">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-[#FC9EC6] text-light">
                  <CubeIcon width={18} />
                </div>

                <div className="ms-3">
                  <p className="mb-0.5 text-lg font-semibold text-sub-heading">
                    {products_count}
                  </p>
                  <p className="mt-0 text-sm text-muted">
                    {t('common:text-total-products')}
                  </p>
                </div>
              </div>

              <div className="flex items-center px-4 py-3">
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-[#6EBBFD] text-light">
                  <OrdersIcon width={16} />
                </div>

                <div className="ms-3">
                  <p className="mb-0.5 text-lg font-semibold text-sub-heading">
                    {orders_count}
                  </p>
                  <p className="mt-0 text-sm text-muted">
                    {t('common:text-total-orders')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-heading">
              {t('common:text-revenue')}
            </h2>

            <div className="border border-gray-100">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-[#C7AF99] text-light">
                  <PriceWalletIcon width={16} />
                </div>

                <div className="ms-3">
                  <p className="mb-0.5 text-lg font-semibold text-sub-heading">
                    {totalEarnings}
                  </p>
                  <p className="mt-0 text-sm text-muted">
                    {t('common:text-gross-sales')}
                  </p>
                </div>
              </div>

              <div className="flex items-center px-4 py-3">
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-[#FFA7AE] text-light">
                  <DollarIcon width={12} />
                </div>

                <div className="ms-3">
                  <p className="mb-0.5 text-lg font-semibold text-sub-heading">
                    {currentBalance}
                  </p>
                  <p className="mt-0 text-sm text-muted">
                    {t('common:text-current-balance')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-heading">
              {t('common:text-others')}
            </h2>

            <div className="border border-gray-100">
              <div className="flex items-center px-4 py-3 border-b border-gray-100">
                <div className="p-3 rounded-full w-11 h-11 flex items-center justify-center bg-[#D59066] text-light">
                  <PercentageIcon width={16} />
                </div>

                <div className="ms-3">
                  <p className="mb-0.5 text-lg font-semibold text-sub-heading">
                    {`${balance?.admin_commission_rate ?? 0} %` ?? 'Not Set'}
                  </p>
                  <p className="mt-0 text-sm text-muted">
                    {t('common:text-commission-rate')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Misc. Information */}
      <div className="order-3 col-span-12 rounded xl:order-4 bg-light sm:col-span-6 xl:col-span-3">
        <div className="flex flex-col p-6 border-b border-gray-200 2xl:p-7">
          <span className="mb-2 text-sm text-muted">
            {t('common:text-registered-since')}
          </span>
          <span className="text-sm font-semibold text-sub-heading">
            {dayjs(created_at).format('MMMM D, YYYY')}
          </span>
        </div>

        <div className="flex flex-col p-6 2xl:p-7">
          <span className="mb-4 text-lg font-semibold text-sub-heading">
            {t('common:text-payment-info')}
          </span>

          <div className="flex flex-col space-y-3">
            <p className="text-sm text-sub-heading">
              <span className="block w-full text-muted">
                {t('common:text-name')}:
              </span>{' '}
              <span className="font-semibold">
                {balance?.payment_info?.name}
              </span>
            </p>
            <p className="text-sm text-sub-heading">
              <span className="block w-full text-muted">
                {t('common:text-email')}:
              </span>{' '}
              <span className="font-semibold">
                {balance?.payment_info?.email}
              </span>
            </p>
            <p className="text-sm text-sub-heading">
              <span className="block w-full text-muted">
                {t('common:text-bank')}:
              </span>{' '}
              <span className="font-semibold">
                {balance?.payment_info?.bank}
              </span>
            </p>
            <p className="text-sm text-sub-heading">
              <span className="block w-full text-muted">
                {t('common:text-account-no')}:
              </span>{' '}
              <span className="font-semibold">
                {balance?.payment_info?.account}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
ShopPage.Layout = ShopLayout;
ShopPage.authenticate = {
  permissions: adminOwnerAndStaffOnly,
};
export const getServerSideProps = async ({ locale, params }: any) => {
  const apolloClient = initializeApollo();
  const { data } = await apolloClient.query({
    query: ShopDocument,
    variables: { slug: params.shop },
  });
  if (!data?.shop) {
    return {
      notFound: true,
    };
  }
  return addApolloState(apolloClient, {
    props: {
      ...(await serverSideTranslations(locale, ['form', 'common'])),
    },
  });
};
