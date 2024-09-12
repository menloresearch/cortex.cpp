PACKAGE_NAME=$1
VERSION=$2
SOURCE_BINARY_PATH=$3
DESTINATION_BINARY_NAME=$4
DATA_FOLDER_NAME=$5
CONFIGURATION_FILE_NAME=$6

mkdir -p $PACKAGE_NAME/DEBIAN

mkdir -p $PACKAGE_NAME/usr/bin
cp $SOURCE_BINARY_PATH $PACKAGE_NAME/usr/bin/$DESTINATION_BINARY_NAME

export DESTINATION_BINARY_NAME

cp postinst $PACKAGE_NAME/DEBIAN/postinst
sed -i '2s/.*/DESTINATION_BINARY_NAME=\$DESTINATION_BINARY_NAME/' $PACKAGE_NAME/DEBIAN/postinst

cp prerm $PACKAGE_NAME/DEBIAN/prerm
sed -i '3s/.*/DESTINATION_BINARY_NAME=\$DESTINATION_BINARY_NAME/' $PACKAGE_NAME/DEBIAN/prerm

export DATA_FOLDER_NAME CONFIGURATION_FILE_NAME

cp postrm $PACKAGE_NAME/DEBIAN/postrm
sed -i '3s/.*/DATA_FOLDER_NAME=\$DATA_FOLDER_NAME/' $PACKAGE_NAME/DEBIAN/postrm
sed -i '4s/.*/CONFIGURATION_FILE_NAME=\$CONFIGURATION_FILE_NAME/' $PACKAGE_NAME/DEBIAN/postrm

chmod 755 $PACKAGE_NAME/DEBIAN/postinst
chmod 755 $PACKAGE_NAME/DEBIAN/postrm
chmod 755 $PACKAGE_NAME/DEBIAN/prerm

export PACKAGE_NAME VERSION

envsubst < control > $PACKAGE_NAME/DEBIAN/control

dpkg-deb --build $PACKAGE_NAME $PACKAGE_NAME.deb